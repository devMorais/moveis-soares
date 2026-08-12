import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { CategoriaAdminService } from '../../../core/services/categoria-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { CategoriaAdmin } from '../../../core/types/categoria/categoria-admin.type';
import { UploadImagem } from '../../../shared/components/upload-imagem/upload-imagem';
import { Datatable } from '../../../shared/components/datatable/datatable';

@Component({
    selector: 'app-admin-categorias',
    imports: [ReactiveFormsModule, UploadImagem, Datatable],
    templateUrl: './categorias.html',
    styleUrl: './categorias.scss',
})
export class Categorias implements OnInit {
    private fb = inject(FormBuilder);
    private categoriasService = inject(CategoriaAdminService);
    private toast = inject(ToastService);
    private confirmDialog = inject(ConfirmDialogService);
    private auth = inject(AuthService);

    readonly uploadEndpoint = `${environment.apiUrl}/produtos/upload-imagem`;

    isAdmin = computed(() => this.auth.currentUser()?.role === 'admin');

    categorias = signal<CategoriaAdmin[]>([]);
    carregando = signal(true);
    salvando = signal(false);
    editandoId = signal<number | null>(null);
    imagemUrl = signal<string | null>(null);

    form = this.fb.nonNullable.group({
        nome: ['', Validators.required],
        slug: [''],
        ativo: [true],
        ordem_exibicao: [0, [Validators.min(0)]],
    });

    colunas = computed<ColDef<CategoriaAdmin>[]>(() => {
        const base: ColDef<CategoriaAdmin>[] = [
            { field: 'ordemExibicao', headerName: 'Ordem', flex: 1, sortable: true },
            { field: 'nome', headerName: 'Nome', flex: 2, sortable: true, filter: true },
            { field: 'totalProdutos', headerName: 'Produtos', flex: 1, sortable: true },
            {
                field: 'ativo',
                headerName: 'Status',
                flex: 1,
                sortable: true,
                cellRenderer: (params: { value: boolean }) =>
                    `<span class="badge-status ${params.value ? 'badge-status--ativo' : ''}">${params.value ? 'Ativa' : 'Inativa'}</span>`,
            },
        ];

        const btnRemover = this.isAdmin()
            ? `<button type="button" class="acoes-celula__btn" data-acao="remover" aria-label="Remover"><i class="fas fa-trash"></i></button>`
            : '';

        return [
            ...base,
            {
                headerName: '',
                flex: 1,
                sortable: false,
                filter: false,
                cellRenderer: () => `
                    <div class="acoes-celula">
                        <button type="button" class="acoes-celula__btn" data-acao="editar" aria-label="Editar"><i class="fas fa-pen"></i></button>
                        ${btnRemover}
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
    });

    ngOnInit(): void {
        this.carregar();
    }

    private carregar(): void {
        this.carregando.set(true);
        this.categoriasService.listar().subscribe({
            next: (categorias) => {
                this.categorias.set(categorias);
                this.carregando.set(false);
            },
            error: () => this.carregando.set(false),
        });
    }

    aoConcluirUpload(url: string): void {
        this.imagemUrl.set(url);
    }

    editar(categoria: CategoriaAdmin): void {
        this.editandoId.set(categoria.id);
        this.imagemUrl.set(categoria.imagemUrl);
        this.form.patchValue({
            nome: categoria.nome,
            slug: categoria.slug,
            ativo: categoria.ativo,
            ordem_exibicao: categoria.ordemExibicao,
        });
    }

    cancelarEdicao(): void {
        this.editandoId.set(null);
        this.imagemUrl.set(null);
        this.form.reset({ nome: '', slug: '', ativo: true, ordem_exibicao: 0 });
    }

    salvar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.salvando.set(true);
        const valores = this.form.getRawValue();
        const dados = {
            nome: valores.nome,
            slug: valores.slug || null,
            imagem_url: this.imagemUrl(),
            ativo: valores.ativo,
            ordem_exibicao: valores.ordem_exibicao,
        };
        const id = this.editandoId();

        const requisicao = id ? this.categoriasService.atualizar(id, dados) : this.categoriasService.criar(dados);

        requisicao.subscribe({
            next: () => {
                this.salvando.set(false);
                this.toast.sucesso(id ? 'Categoria atualizada.' : 'Categoria cadastrada.');
                this.cancelarEdicao();
                this.carregar();
            },
            error: () => this.salvando.set(false), // authInterceptor ja mostra o toast de erro
        });
    }

    async remover(categoria: CategoriaAdmin): Promise<void> {
        const confirmado = await this.confirmDialog.confirmar({
            titulo: 'Remover categoria',
            mensagem: `Tem certeza que deseja remover "${categoria.nome}"? Essa ação não pode ser desfeita.`,
        });
        if (!confirmado) return;

        this.categoriasService.remover(categoria.id).subscribe({
            next: () => {
                this.toast.sucesso('Categoria removida.');
                this.carregar();
            },
            error: () => {}, // authInterceptor ja mostra o toast de erro
        });
    }
}
