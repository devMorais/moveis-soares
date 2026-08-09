import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { Navbar } from './shared/components/layout/navbar/navbar';
import { Footer } from './shared/components/layout/footer/footer';
import { WhatsappFab } from './shared/components/layout/whatsapp-fab/whatsapp-fab';
import { CarrinhoLateral } from './shared/components/carrinho-lateral/carrinho-lateral';
import { Toast } from './shared/components/toast/toast';
import { Seo } from './core/services/seo';
import { SiteService } from './core/services/site.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Navbar, Footer, WhatsappFab, CarrinhoLateral, Toast],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    private router = inject(Router);
    private seo = inject(Seo);
    private site = inject(SiteService);

    /**
     * O painel /admin tem layout próprio, independente do site público.
     */
    isAdminRoute = toSignal(
        this.router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            map((event) => event.urlAfterRedirects.startsWith('/admin')),
            startWith(this.router.url.startsWith('/admin')),
        ),
        { initialValue: this.router.url.startsWith('/admin') },
    );

    constructor() {
        this.seo.carregarConfiguracaoGlobal();
        this.site.carregar();
    }
}
