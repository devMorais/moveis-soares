import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_INFO } from '../../core/constants/site-info';
import { SiteService } from '../../core/services/site.service';
import { Seo } from '../../core/services/seo';

const ICONES_DIFERENCIAIS = ['fa-star', 'fa-tag', 'fa-truck', 'fa-comments'];

@Component({
    selector: 'app-sobre',
    imports: [RouterLink],
    templateUrl: './sobre.html',
    styleUrl: './sobre.scss',
})
export class Sobre implements OnInit {
    private site = inject(SiteService);
    private seo = inject(Seo);

    marca = SITE_INFO;

    sobre = computed(() => this.site.conteudo().sobre);
    cta = computed(() => this.site.conteudo().cta['sobre']);
    contatoVisivel = computed(() => this.site.conteudo().secoesVisiveis['contato'] ?? true);

    diferenciais = computed(() =>
        (this.sobre()?.diferenciais ?? []).map((item, indice) => ({
            ...item,
            icone: ICONES_DIFERENCIAIS[indice] ?? 'fa-star',
        })),
    );

    ngOnInit(): void {
        this.seo.set({
            title: 'Sobre nós',
            description: 'Conheça a história da Móveis Soares e por que escolher a gente pra renovar sua casa com qualidade e preço justo.',
        });
    }
}
