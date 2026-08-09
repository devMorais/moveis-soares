import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ColDef } from 'ag-grid-community';
import { ProdutoAdminService } from '../../../core/services/produto-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { LightboxService } from '../../../shared/components/lightbox/lightbox.service';
import { Produto } from '../../../core/types/produto/produto.type';
import { Datatable } from '../../../shared/components/datatable/datatable';

@Component({
    selector: 'app-admin-produtos',
    imports: [RouterLink, Datatable],
    templateUrl: './produtos.html',
    styleUrl: './produtos.scss',
})
export class Produtos implements OnInit {
    private produtosService = inject(ProdutoAdminService);
    private toast = inject(ToastService);
    private router = inject(Router);
    lightbox = inject(LightboxService);

    produtos = signal<Produto[]>([]);
    carregando = signal(true);

    colunas: ColDef<Produto>[] = [
        {
            headerName: '',
            width: 70,
            sortable: false,
            filter: false,
            cellRenderer: (params: { data?: Produto }) =>
                `<img src="${params.data?.imagemUrl}" alt="${params.data?.nome ?? ''}" class="tabela-produtos__thumb" data-acao="foto" />`,
            onCellClicked: (event) => {
                if (event.data?.imagemUrl) this.lightbox.abrir(event.data.imagemUrl);
            },
        },
        { field: 'nome', headerName: 'Nome', flex: 2, sortable: true, filter: true },
        { field: 'categoria', headerName: 'Categoria', flex: 1, sortable: true, filter: true },
        {
            field: 'preco',
            headerName: 'Preço',
            flex: 1,
            sortable: true,
            valueFormatter: (params) => `R$ ${params.value}`,
        },
        {
            field: 'estoque',
            headerName: 'Estoque',
            flex: 1,
            sortable: true,
            valueFormatter: (params) => (params.value ?? '—').toString(),
        },
        {
            headerName: 'Status',
            flex: 1,
            sortable: false,
            filter: false,
            cellRenderer: (params: { data?: Produto }) => {
                const ativo = params.data?.ativo !== false;
                return `<button type="button" class="badge-status ${ativo ? 'badge-status--ativo' : ''}" data-acao="status">${ativo ? 'Ativo' : 'Inativo'}</button>`;
            },
            onCellClicked: (event) => {
                if (event.data) this.alternarAtivo(event.data);
            },
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
                if (acao === 'editar') this.router.navigate(['/admin/produtos', event.data.id, 'editar']);
                if (acao === 'remover') this.remover(event.data);
            },
        },
    ];

    ngOnInit(): void {
        this.carregar();
    }

    private carregar(): void {
        this.carregando.set(true);
        this.produtosService.listar().subscribe({
            next: (produtos) => {
                this.produtos.set(produtos);
                this.carregando.set(false);
            },
            error: () => this.carregando.set(false),
        });
    }

    remover(produto: Produto): void {
        this.produtosService.remover(produto.id).subscribe({
            next: () => {
                this.toast.sucesso('Produto removido.');
                this.carregar();
            },
            error: (erro: HttpErrorResponse) => {
                // 422 = produto ja apareceu em pedido, backend recusou por
                // integridade - oferece desativar como alternativa clara.
                if (erro.status === 422) {
                    this.toast.aviso(
                        'Este produto já foi vendido e não pode ser excluído. Use "Desativar" para escondê-lo do site.',
                        'Não é possível excluir',
                    );
                } else {
                    this.toast.erro('Não foi possível remover o produto.');
                }
            },
        });
    }

    alternarAtivo(produto: Produto): void {
        const novoValor = !produto.ativo;

        this.produtosService.alternarAtivo(produto.id, novoValor).subscribe({
            next: () => {
                this.toast.sucesso(novoValor ? 'Produto ativado.' : 'Produto desativado e escondido do site.');
                this.carregar();
            },
            error: () => this.toast.erro('Não foi possível atualizar o status do produto.'),
        });
    }
}
