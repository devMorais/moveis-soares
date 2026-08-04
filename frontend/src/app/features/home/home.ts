import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRODUTOS_MOCK } from '../../core/constants/produtos-mock';
import { SITE_INFO } from '../../core/constants/site-info';

@Component({
    selector: 'app-home',
    imports: [RouterLink],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home {
    info = SITE_INFO;
    produtos = signal(PRODUTOS_MOCK);
    slideAtual = signal(0);

    proximoSlide() {
        this.slideAtual.update((i) => (i + 1) % this.produtos().length);
    }

    slideAnterior() {
        this.slideAtual.update((i) => (i - 1 + this.produtos().length) % this.produtos().length);
    }

    irParaSlide(indice: number) {
        this.slideAtual.set(indice);
    }
}
