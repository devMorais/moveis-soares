import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ColDef } from 'ag-grid-community';
import { ProdutoAdminService } from '../../../core/services/produto-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { ClipboardService } from '../../../core/services/clipboard.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AuthService } from '../../../core/services/auth.service';
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
    private clipboard = inject(ClipboardService);
    private confirmDialog = inject(ConfirmDialogService);
    private auth = inject(AuthService);
    private router = inject(Router);
    lightbox = inject(LightboxService);

    isAdmin = computed(() => this.auth.currentUser()?.role === 'admin');

    produtos = signal<Produto[]>([]);
    carregando = signal(true);
    produtoSelecionado = signal<Produto | null>(null);

    colunas = computed<ColDef<Produto>[]>(() => {
        const admin = this.isAdmin();

        const base: ColDef<Produto>[] = [
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
            { field: 'categoria', headerName: 'Categoria', flex: 1, minWidth: 120, sortable: true, filter: true },
            {
                field: 'preco',
                headerName: 'Preço',
                flex: 1,
                minWidth: 100,
                sortable: true,
                valueFormatter: (params) => `R$ ${params.value}`,
            },
            {
                field: 'estoque',
                headerName: 'Estoque',
                flex: 1,
                minWidth: 90,
                sortable: true,
                valueFormatter: (params) => (params.value ?? '—').toString(),
            },
            admin
                ? {
                      headerName: 'Status',
                      flex: 1,
                      minWidth: 100,
                      sortable: false,
                      filter: false,
                      cellRenderer: (params: { data?: Produto }) => {
                          const ativo = params.data?.ativo !== false;
                          return `<button type="button" class="badge-status ${ativo ? 'badge-status--ativo' : ''}" data-acao="status">${ativo ? 'Ativo' : 'Inativo'}</button>`;
                      },
                      onCellClicked: (event: { data?: Produto }) => {
                          if (event.data) this.alternarAtivo(event.data);
                      },
                  }
                : {
                      headerName: 'Status',
                      flex: 1,
                      minWidth: 100,
                      sortable: false,
                      filter: false,
                      cellRenderer: (params: { data?: Produto }) => {
                          const ativo = params.data?.ativo !== false;
                          return `<span class="badge-status ${ativo ? 'badge-status--ativo' : ''}">${ativo ? 'Ativo' : 'Inativo'}</span>`;
                      },
                  },
        ];

        const btnRemover = admin
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
                        <button type="button" class="acoes-celula__btn" data-acao="detalhe" aria-label="Ver detalhes"><i class="fas fa-eye"></i></button>
                        <button type="button" class="acoes-celula__btn" data-acao="editar" aria-label="Editar"><i class="fas fa-pen"></i></button>
                        ${btnRemover}
                    </div>
                `,
                onCellClicked: (event) => {
                    const alvo = event.event?.target as HTMLElement;
                    const acao = alvo?.closest('[data-acao]')?.getAttribute('data-acao');
                    if (!event.data) return;
                    if (acao === 'detalhe') this.abrirDetalhe(event.data);
                    if (acao === 'editar') this.router.navigate(['/admin/produtos', event.data.id, 'editar']);
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
        this.produtosService.listar().subscribe({
            next: (produtos) => {
                this.produtos.set(produtos);
                this.carregando.set(false);
            },
            error: () => this.carregando.set(false),
        });
    }

    async remover(produto: Produto): Promise<void> {
        const confirmado = await this.confirmDialog.confirmar({
            titulo: 'Remover produto',
            mensagem: `Tem certeza que deseja remover "${produto.nome}"? Essa ação não pode ser desfeita.`,
        });
        if (!confirmado) return;

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

    abrirDetalhe(produto: Produto): void {
        this.produtoSelecionado.set(produto);
    }

    fecharDetalhe(): void {
        this.produtoSelecionado.set(null);
    }

    galeriaDetalhe(produto: Produto): string[] {
        return [produto.imagemUrl, ...(produto.imagens ?? [])];
    }

    urlPublica(produto: Produto): string {
        return `${window.location.origin}/produto/${produto.slug}`;
    }

    copiarUrlPublica(produto: Produto): void {
        this.clipboard.copiar(this.urlPublica(produto), 'URL do produto copiada.');
    }
}
