import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_INFO } from '../../../../core/constants/site-info';
import { SiteService } from '../../../../core/services/site.service';

@Component({
    selector: 'app-footer',
    imports: [RouterLink],
    templateUrl: './footer.html',
    styleUrl: './footer.scss',
})
export class Footer {
    private site = inject(SiteService);

    marca = SITE_INFO;
    ano = new Date().getFullYear();

    contato = computed(() => this.site.conteudo().contato);
    sobreVisivel = computed(() => this.site.conteudo().secoesVisiveis['sobre'] ?? true);
    contatoVisivel = computed(() => this.site.conteudo().secoesVisiveis['contato'] ?? true);
}
