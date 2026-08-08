import { Component, OnDestroy, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProdutoService } from '../../core/services/produto';
import { CategoriaService } from '../../core/services/categoria';
import { Produto } from '../../core/types/produto/produto.type';
import { Categoria } from '../../core/types/categoria/categoria.type';
import { SITE_INFO } from '../../core/constants/site-info';
import { InstagramSecao } from './instagram-secao/instagram-secao';

const INTERVALO_AUTOPLAY_MS = 5000;

@Component({
    selector: 'app-home',
    imports: [RouterLink, InstagramSecao],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
    private platformId = inject(PLATFORM_ID);
    private produtoService = inject(ProdutoService);
    private categoriaService = inject(CategoriaService);

    info = SITE_INFO;
    categorias = signal<Categoria[]>([]);
    produtos = signal<Produto[]>([]);

    /** Só os produtos com selo entram no carrossel de destaque do hero. */
    destaques = computed(() => this.produtos().filter((p) => p.selo));

    slideAtual = signal(0);
    private timerId?: ReturnType<typeof setInterval>;

    categoriaAtiva = signal<string | null>(null);
    produtosFiltrados = computed(() => {
        const categoria = this.categoriaAtiva();
        if (!categoria) return this.produtos();
        return this.produtos().filter((p) => p.categoria.toLowerCase() === categoria.toLowerCase());
    });

    ngOnInit(): void {
        this.produtoService.listar().subscribe((produtos) => this.produtos.set(produtos));
        this.categoriaService.listar().subscribe((categorias) => this.categorias.set(categorias));
        this.iniciarAutoplay();
    }

    ngOnDestroy(): void {
        this.pararAutoplay();
    }

    private iniciarAutoplay(): void {
        this.pararAutoplay();
        // setInterval nunca deve rodar durante o prerender SSR — o Node
        // aguarda o timer e o build trava em timeout esperando ele "acabar".
        if (!isPlatformBrowser(this.platformId)) return;
        this.timerId = setInterval(() => this.proximoSlide(), INTERVALO_AUTOPLAY_MS);
    }

    private pararAutoplay(): void {
        if (this.timerId) clearInterval(this.timerId);
    }

    proximoSlide(): void {
        const total = this.destaques().length;
        if (total === 0) return;
        this.slideAtual.update((i) => (i + 1) % total);
    }

    slideAnterior(): void {
        const total = this.destaques().length;
        if (total === 0) return;
        this.slideAtual.update((i) => (i - 1 + total) % total);
    }

    irParaSlide(indice: number): void {
        this.slideAtual.set(indice);
        this.iniciarAutoplay();
    }

    filtrarPorCategoria(nome: string | null): void {
        this.categoriaAtiva.set(nome);
    }
}
