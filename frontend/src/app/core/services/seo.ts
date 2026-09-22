import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface SeoConfig {
    title: string;
    description: string;
    image?: string;
}

export interface ConfiguracaoSeoPublica {
    tituloSite: string | null;
    tituloPadrao: string | null;
    descricaoPadrao: string | null;
    palavrasChave: string | null;
    ogImageUrl: string | null;
    faviconUrl: string | null;
    googleAnalyticsId: string | null;
    googleSearchConsoleTag: string | null;
    indexarSite: boolean;
}

const NOME_SITE_PADRAO = 'Móveis Soares';

@Injectable({
    providedIn: 'root',
})
export class Seo {
    private readonly meta = inject(Meta);
    private readonly title = inject(Title);
    private readonly http = inject(HttpClient);
    private readonly documento = inject(DOCUMENT);
    private readonly router = inject(Router);

    private config: ConfiguracaoSeoPublica | null = null;

    /**
     * Busca a config de SEO administrável (nome do site, GA, GSC, robots) e
     * aplica os efeitos globais uma unica vez - chamado no bootstrap do app.
     */
    carregarConfiguracaoGlobal(): void {
        this.http.get<ConfiguracaoSeoPublica>(`${environment.apiUrl}/seo`).subscribe({
            next: (config) => {
                this.config = config;
                this.aplicarRobots(config.indexarSite);
                this.aplicarGoogleSearchConsole(config.googleSearchConsoleTag);
                this.aplicarGoogleAnalytics(config.googleAnalyticsId);
            },
            error: () => {
                // Sem configuracao ainda cadastrada - segue com os defaults do código.
            },
        });
    }

    set(config: SeoConfig): void {
        const nomeSite = this.config?.tituloSite || NOME_SITE_PADRAO;
        const tituloCompleto = `${config.title} | ${nomeSite}`;

        this.title.setTitle(tituloCompleto);

        this.meta.updateTag({ name: 'description', content: config.description });
        this.meta.updateTag({ property: 'og:title', content: tituloCompleto });
        this.meta.updateTag({ property: 'og:description', content: config.description });

        const imagem = config.image || this.config?.ogImageUrl;
        if (imagem) {
            this.meta.updateTag({ property: 'og:image', content: imagem });
        }

        this.aplicarCanonical();
    }

    /**
     * Aponta cada pagina para o dominio proprio. Usa a rota do Router (e nao
     * window.location) porque isso tambem roda na pre-renderizacao, onde nao
     * existe window.
     */
    private aplicarCanonical(): void {
        const caminho = this.router.url.split('?')[0].split('#')[0];
        const href = `${environment.siteUrl}${caminho}`;

        let link = this.documento.querySelector<HTMLLinkElement>('link[rel="canonical"]');

        if (!link) {
            link = this.documento.createElement('link');
            link.setAttribute('rel', 'canonical');
            this.documento.head.appendChild(link);
        }

        link.setAttribute('href', href);
    }

    private aplicarRobots(indexar: boolean): void {
        this.meta.updateTag({ name: 'robots', content: indexar ? 'index, follow' : 'noindex, nofollow' });
    }

    private aplicarGoogleSearchConsole(conteudo: string | null): void {
        if (!conteudo) return;
        this.meta.updateTag({ name: 'google-site-verification', content: conteudo });
    }

    private aplicarGoogleAnalytics(idMedicao: string | null): void {
        if (!idMedicao || typeof document === 'undefined') return;

        const scriptGtag = document.createElement('script');
        scriptGtag.async = true;
        scriptGtag.src = `https://www.googletagmanager.com/gtag/js?id=${idMedicao}`;
        document.head.appendChild(scriptGtag);

        const scriptInit = document.createElement('script');
        scriptInit.textContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${idMedicao}');
        `;
        document.head.appendChild(scriptInit);
    }
}
