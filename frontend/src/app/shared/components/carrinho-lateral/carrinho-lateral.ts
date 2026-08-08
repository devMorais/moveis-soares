import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CarrinhoService } from '../../../core/services/carrinho.service';

@Component({
    selector: 'app-carrinho-lateral',
    templateUrl: './carrinho-lateral.html',
    styleUrl: './carrinho-lateral.scss',
})
export class CarrinhoLateral {
    private router = inject(Router);
    carrinho = inject(CarrinhoService);

    diminuir(produtoId: number, quantidadeAtual: number): void {
        this.carrinho.atualizarQuantidade(produtoId, quantidadeAtual - 1);
    }

    aumentar(produtoId: number, quantidadeAtual: number): void {
        this.carrinho.atualizarQuantidade(produtoId, quantidadeAtual + 1);
    }

    finalizarCompra(): void {
        this.carrinho.fechar();
        this.router.navigate(['/checkout']);
    }
}
