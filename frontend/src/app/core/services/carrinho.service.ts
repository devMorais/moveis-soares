import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Produto } from '../types/produto/produto.type';
import { ItemCarrinho } from '../types/carrinho/item-carrinho.type';

const CHAVE_STORAGE = 'carrinho';

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
    private platformId = inject(PLATFORM_ID);

    itens = signal<ItemCarrinho[]>(this.carregarDoStorage());
    aberto = signal(false);

    subtotal = computed(() => this.itens().reduce((soma, item) => soma + item.preco * item.quantidade, 0));
    totalItens = computed(() => this.itens().reduce((soma, item) => soma + item.quantidade, 0));

    constructor() {
        effect(() => {
            if (!this.isBrowser()) return;
            localStorage.setItem(CHAVE_STORAGE, JSON.stringify(this.itens()));
        });
    }

    private isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    private carregarDoStorage(): ItemCarrinho[] {
        if (!this.isBrowser()) return [];
        const bruto = localStorage.getItem(CHAVE_STORAGE);
        return bruto ? JSON.parse(bruto) : [];
    }

    abrir(): void {
        this.aberto.set(true);
    }

    fechar(): void {
        this.aberto.set(false);
    }

    /**
     * Retorna false (e nao adiciona nada) se a quantidade pedida ultrapassar
     * o estoque disponivel do produto - o chamador decide como avisar o
     * usuario.
     */
    adicionar(produto: Produto, quantidade: number): boolean {
        const jaNoCarrinho = this.itens().find((item) => item.produtoId === produto.id)?.quantidade ?? 0;
        const quantidadeFinal = jaNoCarrinho + quantidade;

        if (produto.estoque !== undefined && quantidadeFinal > produto.estoque) {
            return false;
        }

        this.itens.update((atuais) => {
            const existente = atuais.find((item) => item.produtoId === produto.id);

            if (existente) {
                return atuais.map((item) =>
                    item.produtoId === produto.id ? { ...item, quantidade: quantidadeFinal } : item,
                );
            }

            return [
                ...atuais,
                {
                    produtoId: produto.id,
                    nome: produto.nome,
                    slug: produto.slug,
                    imagemUrl: produto.imagemUrl,
                    preco: produto.preco,
                    quantidade,
                },
            ];
        });

        return true;
    }

    atualizarQuantidade(produtoId: number, quantidade: number): void {
        if (quantidade <= 0) {
            this.removerItem(produtoId);
            return;
        }

        this.itens.update((atuais) =>
            atuais.map((item) => (item.produtoId === produtoId ? { ...item, quantidade } : item)),
        );
    }

    removerItem(produtoId: number): void {
        this.itens.update((atuais) => atuais.filter((item) => item.produtoId !== produtoId));
    }

    limpar(): void {
        this.itens.set([]);
    }
}
