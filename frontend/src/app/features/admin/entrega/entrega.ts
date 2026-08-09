import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { CidadeEntregaAdminService } from '../../../core/services/cidade-entrega-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { CidadeEntrega } from '../../../core/types/cidade-entrega/cidade-entrega.type';
import { Datatable } from '../../../shared/components/datatable/datatable';

@Component({
    selector: 'app-admin-entrega',
    imports: [ReactiveFormsModule, Datatable],
    templateUrl: './entrega.html',
    styleUrl: './entrega.scss',
})
export class Entrega implements OnInit {
    private fb = inject(FormBuilder);
    private cidadesService = inject(CidadeEntregaAdminService);
    private toast = inject(ToastService);
    private confirmDialog = inject(ConfirmDialogService);

    cidades = signal<CidadeEntrega[]>([]);
    carregando = signal(true);
    salvando = signal(false);
    editandoId = signal<number | null>(null);

    colunas: ColDef<CidadeEntrega>[] = [
        {
            field: 'nomeCidade',
            headerName: 'Cidade',
            flex: 2,
            sortable: true,
            filter: true,
            cellRenderer: (params: { data?: CidadeEntrega }) =>
                params.data?.ehRetiradaLocal
                    ? `${params.data.nomeCidade} <span class="badge">retirada</span>`
                    : params.data?.nomeCidade ?? '',
        },
        { field: 'uf', headerName: 'UF', flex: 1, sortable: true, filter: true },
        {
            field: 'valorFrete',
            headerName: 'Frete',
            flex: 1,
            sortable: true,
            valueFormatter: (params) => `R$ ${params.value}`,
        },
        {
            field: 'prazoDiasEstimado',
            headerName: 'Prazo',
            flex: 1,
            sortable: true,
            valueFormatter: (params) => (params.value ? `${params.value} dias` : '-'),
        },
        {
            headerName: '',
            flex: 1,
            sortable: false,
            filter: false,
            cellRenderer: () => `
                <div class="acoes-celula">
                    <button type="button" class="acoes-celula__btn" data-acao="editar" aria-label="Editar"><i class="fas fa-pen"></i></button>
                    <button type="button" class="acoes-celula__btn" data-acao="remover" aria-label="Remover"><i class="fas fa-trash"></i></button>
                </div>
            `,
            onCellClicked: (event) => {
                const alvo = event.event?.target as HTMLElement;
                const acao = alvo?.closest('[data-acao]')?.getAttribute('data-acao');
                if (!event.data) return;
                if (acao === 'editar') this.editar(event.data);
                if (acao === 'remover') this.remover(event.data);
            },
        },
    ];

    form = this.fb.nonNullable.group({
        nome_cidade: ['', Validators.required],
        uf: ['', [Validators.required, Validators.maxLength(2)]],
        valor_frete: [0, [Validators.required, Validators.min(0)]],
        prazo_dias_estimado: [null as number | null],
        eh_retirada_local: [false],
    });

    ngOnInit(): void {
        this.carregar();
    }

    private carregar(): void {
        this.carregando.set(true);
        this.cidadesService.listar().subscribe({
            next: (cidades) => {
                this.cidades.set(cidades);
                this.carregando.set(false);
            },
            error: () => this.carregando.set(false),
        });
    }

    editar(cidade: CidadeEntrega): void {
        this.editandoId.set(cidade.id);
        this.form.patchValue({
            nome_cidade: cidade.nomeCidade,
            uf: cidade.uf,
            valor_frete: cidade.valorFrete,
            prazo_dias_estimado: cidade.prazoDiasEstimado,
            eh_retirada_local: cidade.ehRetiradaLocal,
        });
    }

    cancelarEdicao(): void {
        this.editandoId.set(null);
        this.form.reset({ nome_cidade: '', uf: '', valor_frete: 0, prazo_dias_estimado: null, eh_retirada_local: false });
    }

    salvar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.salvando.set(true);
        const dados = this.form.getRawValue();
        const id = this.editandoId();

        const requisicao = id ? this.cidadesService.atualizar(id, dados) : this.cidadesService.criar(dados);

        requisicao.subscribe({
            next: () => {
                this.salvando.set(false);
                this.toast.sucesso(id ? 'Cidade atualizada.' : 'Cidade cadastrada.');
                this.cancelarEdicao();
                this.carregar();
            },
            error: () => {
                this.salvando.set(false);
                this.toast.erro('Não foi possível salvar a cidade.');
            },
        });
    }

    async remover(cidade: CidadeEntrega): Promise<void> {
        const confirmado = await this.confirmDialog.confirmar({
            titulo: 'Remover cidade',
            mensagem: `Tem certeza que deseja remover "${cidade.nomeCidade}"? Essa ação não pode ser desfeita.`,
        });
        if (!confirmado) return;

        this.cidadesService.remover(cidade.id).subscribe({
            next: () => {
                this.toast.sucesso('Cidade removida.');
                this.carregar();
            },
            error: () => this.toast.erro('Não foi possível remover a cidade.'),
        });
    }
}
