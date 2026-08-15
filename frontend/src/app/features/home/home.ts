import { Component, OnDestroy, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProdutoService } from '../../core/services/produto';
import { CategoriaService } from '../../core/services/categoria';
import { Produto } from '../../core/types/produto/produto.type';
import { Categoria } from '../../core/types/categoria/categoria.type';
import { SITE_INFO } from '../../core/constants/site-info';
import { SiteService } from '../../core/services/site.service';
import { Seo } from '../../core/services/seo';

const INTERVALO_AUTOPLAY_MS = 5000;
const ICONES_INSTITUCIONAL = ['fa-truck', 'fa-star', 'fa-comments'];

@Component({
    selector: 'app-home',
    imports: [RouterLink],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
    private platformId = inject(PLATFORM_ID);
    private produtoService = inject(ProdutoService);
    private categoriaService = inject(CategoriaService);
    private site = inject(SiteService);
    private seo = inject(Seo);

    info = SITE_INFO;
    categorias = signal<Categoria[]>([]);

    /** Carrossel de destaque do hero - busca propria e independente da paginacao do catalogo. */
    destaques = signal<Produto[]>([]);

    produtos = signal<Produto[]>([]);
    carregando = signal(false);
    private paginaAtual = signal(1);
    private ultimaPagina = signal(1);

    institucional = computed(() => this.site.conteudo().institucional);
    cta = computed(() => this.site.conteudo().cta['home']);
    contato = computed(() => this.site.conteudo().contato);
    sobreVisivel = computed(() => this.site.conteudo().secoesVisiveis['sobre'] ?? true);
    contatoVisivel = computed(() => this.site.conteudo().secoesVisiveis['contato'] ?? true);

    itensInstitucional = computed(() =>
        (this.institucional()?.itens ?? []).map((item, indice) => ({
            ...item,
            icone: ICONES_INSTITUCIONAL[indice] ?? 'fa-star',
        })),
    );

    slideAtual = signal(0);
    private timerId?: ReturnType<typeof setInterval>;

    categoriaAtiva = signal<string | null>(null);

    get temMaisPaginas(): boolean {
        return this.paginaAtual() < this.ultimaPagina();
    }

    ngOnInit(): void {
        this.seo.set({
            title: 'Móveis com qualidade e preço justo',
            description:
                'Móveis de qualidade para escritório, quarto, sala e cozinha, com preço justo e atendimento que cuida de cada detalhe da sua casa.',
        });
        this.produtoService.destaques().subscribe((produtos) => this.destaques.set(produtos));
        this.categoriaService.listar().subscribe((categorias) => this.categorias.set(categorias));
        this.carregarProdutos(1);
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

    filtrarPorCategoria(slug: string | null): void {
        if (this.categoriaAtiva() === slug) return;
        this.categoriaAtiva.set(slug);
        this.carregarProdutos(1);
    }

    carregarMais(): void {
        if (!this.temMaisPaginas || this.carregando()) return;
        this.carregarProdutos(this.paginaAtual() + 1);
    }

    private carregarProdutos(pagina: number): void {
        this.carregando.set(true);
        this.produtoService.listar(pagina, this.categoriaAtiva()).subscribe({
            next: (resposta) => {
                this.produtos.update((atual) => (pagina === 1 ? resposta.data : [...atual, ...resposta.data]));
                this.paginaAtual.set(resposta.current_page);
                this.ultimaPagina.set(resposta.last_page);
                this.carregando.set(false);
            },
            error: () => this.carregando.set(false),
        });
    }
}
