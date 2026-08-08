import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Produto } from '../types/produto/produto.type';

export interface ItemCarrinho {
    produtoId: number;
    nome: string;
    slug?: string;
    imagemUrl: string;
    preco: number;
    quantidade: number;
}

const CHAVE_STORAGE = 'carrinho';

/**
 * Versao minima do carrinho (persistencia em localStorage) - o escopo
 * completo (painel lateral, contador no header) fica para MS-PED-01.
 * Criado aqui como pre-requisito direto do botao "Adicionar ao carrinho"
 * da pagina de produto (MS-PUB-04).
 */
@Injectable({ providedIn: 'root' })
export class CarrinhoService {
    private platformId = inject(PLATFORM_ID);

    itens = signal<ItemCarrinho[]>(this.carregarDoStorage());

    subtotal = computed(() => this.itens().reduce((soma, item) => soma + item.preco * item.quantidade, 0));

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

    adicionar(produto: Produto, quantidade: number): void {
        this.itens.update((atuais) => {
            const existente = atuais.find((item) => item.produtoId === produto.id);

            if (existente) {
                return atuais.map((item) =>
                    item.produtoId === produto.id ? { ...item, quantidade: item.quantidade + quantidade } : item,
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
    }

    removerItem(produtoId: number): void {
        this.itens.update((atuais) => atuais.filter((item) => item.produtoId !== produtoId));
    }
}
