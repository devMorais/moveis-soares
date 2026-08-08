import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CarrinhoService } from '../../../core/services/carrinho.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-carrinho-lateral',
    templateUrl: './carrinho-lateral.html',
    styleUrl: './carrinho-lateral.scss',
})
export class CarrinhoLateral {
    private router = inject(Router);
    private toast = inject(ToastService);
    carrinho = inject(CarrinhoService);

    diminuir(produtoId: number, quantidadeAtual: number): void {
        this.carrinho.atualizarQuantidade(produtoId, quantidadeAtual - 1);
    }

    aumentar(produtoId: number, quantidadeAtual: number): void {
        const conseguiu = this.carrinho.atualizarQuantidade(produtoId, quantidadeAtual + 1);
        if (!conseguiu) {
            this.toast.erro('Não há mais estoque disponível deste produto.');
        }
    }

    finalizarCompra(): void {
        this.carrinho.fechar();
        this.router.navigate(['/checkout']);
    }
}
