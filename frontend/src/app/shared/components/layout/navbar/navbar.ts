import { Component, HostListener, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SITE_INFO } from '../../../../core/constants/site-info';
import { CarrinhoService } from '../../../../core/services/carrinho.service';
import { SiteService } from '../../../../core/services/site.service';
import { CategoriaService } from '../../../../core/services/categoria';
import { Categoria } from '../../../../core/types/categoria/categoria.type';

const LIMIAR_SCROLL_PX = 60;

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './navbar.html',
    styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
    private platformId = inject(PLATFORM_ID);
    private site = inject(SiteService);
    private categoriaService = inject(CategoriaService);
    carrinho = inject(CarrinhoService);

    info = SITE_INFO;
    categorias = signal<Categoria[]>([]);

    logoUrl = computed(() => this.site.conteudo().identidade.logoUrl ?? SITE_INFO.logoUrl);
    sobreVisivel = computed(() => this.site.conteudo().secoesVisiveis['sobre'] ?? true);
    contatoVisivel = computed(() => this.site.conteudo().secoesVisiveis['contato'] ?? true);

    menuAberto = signal(false);
    rolado = signal(false);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.rolado.set(window.scrollY > LIMIAR_SCROLL_PX);
        }
    }

    ngOnInit(): void {
        this.categoriaService.listar().subscribe((categorias) => this.categorias.set(categorias));
    }

    @HostListener('window:scroll')
    onScroll() {
        this.rolado.set(window.scrollY > LIMIAR_SCROLL_PX);
    }

    toggleMenu() {
        this.menuAberto.update((v) => !v);
    }

    fecharMenu() {
        this.menuAberto.set(false);
    }
}
