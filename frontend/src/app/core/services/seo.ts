import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoConfig {
    title: string;
    description: string;
    image?: string;
}

const NOME_SITE = 'Moveis Soares';

@Injectable({
    providedIn: 'root',
})
export class Seo {
    private readonly meta = inject(Meta);
    private readonly title = inject(Title);

    set(config: SeoConfig): void {
        const tituloCompleto = `${config.title} | ${NOME_SITE}`;

        this.title.setTitle(tituloCompleto);

        this.meta.updateTag({ name: 'description', content: config.description });
        this.meta.updateTag({ property: 'og:title', content: tituloCompleto });
        this.meta.updateTag({ property: 'og:description', content: config.description });

        if (config.image) {
            this.meta.updateTag({ property: 'og:image', content: config.image });
        }
    }
}
