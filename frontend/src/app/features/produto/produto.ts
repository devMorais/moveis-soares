import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PinchZoomComponent } from '@meddv/ngx-pinch-zoom';
import { ProdutoService } from '../../core/services/produto';
import { CarrinhoService } from '../../core/services/carrinho.service';
import { ToastService } from '../../core/services/toast.service';
import { Seo } from '../../core/services/seo';
import { Produto as ProdutoType } from '../../core/types/produto/produto.type';

@Component({
    selector: 'app-produto',
    imports: [RouterLink, PinchZoomComponent],
    templateUrl: './produto.html',
    styleUrl: './produto.scss',
})
export class Produto implements OnInit {
    private route = inject(ActivatedRoute);
    private produtoService = inject(ProdutoService);
    private carrinhoService = inject(CarrinhoService);
    private toast = inject(ToastService);
    private seo = inject(Seo);

    produto = signal<ProdutoType | null>(null);
    carregando = signal(true);
    naoEncontrado = signal(false);

    quantidade = signal(1);
    indiceImagemAtual = signal(0);

    /** Foto principal + demais fotos, se houver (ver MS-CAT-02). */
    galeria = computed(() => {
        const p = this.produto();
        if (!p) return [];
        return [p.imagemUrl, ...(p.imagens ?? [])];
    });

    imagemAtual = computed(() => this.galeria()[this.indiceImagemAtual()] ?? '');

    temMedidas = computed(() => {
        const p = this.produto();
        return !!(p?.alturaCm || p?.larguraCm || p?.profundidadeCm);
    });

    semEstoque = computed(() => {
        const estoque = this.produto()?.estoque;
        return estoque !== undefined && estoque <= 0;
    });

    ngOnInit(): void {
        const slug = this.route.snapshot.paramMap.get('slug');
        if (!slug) {
            this.naoEncontrado.set(true);
            this.carregando.set(false);
            return;
        }

        this.produtoService.porSlug(slug).subscribe({
            next: (produto) => {
                this.produto.set(produto);
                this.carregando.set(false);
                this.seo.set({
                    title: produto.nome,
                    description: produto.descricao ?? `${produto.nome} - ${produto.categoria} | Móveis Soares`,
                    image: produto.imagemUrl,
                });
            },
            error: () => {
                this.naoEncontrado.set(true);
                this.carregando.set(false);
            },
        });
    }

    selecionarImagem(indice: number): void {
        this.indiceImagemAtual.set(indice);
    }

    aumentarQuantidade(): void {
        this.quantidade.update((q) => q + 1);
    }

    diminuirQuantidade(): void {
        this.quantidade.update((q) => Math.max(1, q - 1));
    }

    adicionarAoCarrinho(): void {
        const produto = this.produto();
        if (!produto || this.semEstoque()) return;

        const conseguiu = this.carrinhoService.adicionar(produto, this.quantidade());

        if (!conseguiu) {
            this.toast.erro(`Não há estoque suficiente de "${produto.nome}" para essa quantidade.`);
            return;
        }

        this.toast.sucesso(`${produto.nome} adicionado ao carrinho.`);
        this.carrinhoService.abrir();
    }
}
