import { Component, HostListener, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SITE_INFO } from '../../../../core/constants/site-info';
import { CATEGORIAS } from '../../../../core/constants/categorias';
import { CarrinhoService } from '../../../../core/services/carrinho.service';
import { SiteService } from '../../../../core/services/site.service';

const LIMIAR_SCROLL_PX = 60;

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './navbar.html',
    styleUrl: './navbar.scss',
})
export class Navbar {
    private platformId = inject(PLATFORM_ID);
    private site = inject(SiteService);
    carrinho = inject(CarrinhoService);

    info = SITE_INFO;
    categorias = CATEGORIAS;

    sobreVisivel = computed(() => this.site.conteudo().secoesVisiveis['sobre'] ?? true);

    menuAberto = signal(false);
    rolado = signal(false);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.rolado.set(window.scrollY > LIMIAR_SCROLL_PX);
        }
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
