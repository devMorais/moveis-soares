import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProdutoAdminService } from '../../../core/services/produto-admin.service';
import { ToastService } from '../../../core/services/toast.service';
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
            error: () => this.toast.erro('Não foi possível remover o produto.'),
        });
    }
}
