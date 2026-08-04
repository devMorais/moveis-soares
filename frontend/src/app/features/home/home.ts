import { Component, OnDestroy, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PRODUTOS_MOCK } from '../../core/constants/produtos-mock';
import { CATEGORIAS } from '../../core/constants/categorias';
import { SITE_INFO } from '../../core/constants/site-info';

const INTERVALO_AUTOPLAY_MS = 5000;

@Component({
    selector: 'app-home',
    imports: [RouterLink],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
    private platformId = inject(PLATFORM_ID);

    info = SITE_INFO;
    categorias = CATEGORIAS;
    produtos = signal(PRODUTOS_MOCK);

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
