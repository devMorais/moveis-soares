import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProdutoAdminService } from '../../../core/services/produto-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { LightboxService } from '../../../shared/components/lightbox/lightbox.service';
import { Produto } from '../../../core/types/produto/produto.type';

@Component({
    selector: 'app-admin-produtos',
    imports: [RouterLink],
    templateUrl: './produtos.html',
    styleUrl: './produtos.scss',
})
export class Produtos implements OnInit {
    private produtosService = inject(ProdutoAdminService);
    private toast = inject(ToastService);
    lightbox = inject(LightboxService);

    produtos = signal<Produto[]>([]);
    carregando = signal(true);

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
            error: () => {},
        });
    }
}
