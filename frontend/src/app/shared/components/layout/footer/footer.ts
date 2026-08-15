import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SITE_INFO } from '../../../../core/constants/site-info';
import { SiteService } from '../../../../core/services/site.service';

@Component({
    selector: 'app-footer',
    imports: [RouterLink],
    templateUrl: './footer.html',
    styleUrl: './footer.scss',
})
export class Footer implements OnInit {
    private site = inject(SiteService);
    private platformId = inject(PLATFORM_ID);

    marca = SITE_INFO;
    ano = new Date().getFullYear();

    logoUrl = computed(() => this.site.conteudo().identidade.logoUrl ?? SITE_INFO.logoUrl);
    contato = computed(() => this.site.conteudo().contato);
    sobreVisivel = computed(() => this.site.conteudo().secoesVisiveis['sobre'] ?? true);
    contatoVisivel = computed(() => this.site.conteudo().secoesVisiveis['contato'] ?? true);

    /** Tempo de carregamento da primeira navegação, mostrado discretamente no rodapé. */
    tempoCarregamentoMs = signal<number | null>(null);

    ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        if (document.readyState === 'complete') {
            this.medirTempoCarregamento();
        } else {
            window.addEventListener('load', () => this.medirTempoCarregamento(), { once: true });
        }
    }

    private medirTempoCarregamento(): void {
        const [entrada] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (entrada && entrada.loadEventEnd > 0) {
            this.tempoCarregamentoMs.set(Math.round(entrada.loadEventEnd - entrada.startTime));
        }
    }
}
