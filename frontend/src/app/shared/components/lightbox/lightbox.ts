import { Component, HostListener, inject } from '@angular/core';
import { LightboxService } from './lightbox.service';

@Component({
    selector: 'app-lightbox',
    templateUrl: './lightbox.html',
    styleUrl: './lightbox.scss',
})
export class Lightbox {
    lightbox = inject(LightboxService);

    @HostListener('document:keydown.escape')
    aoPressionarEsc(): void {
        this.lightbox.fechar();
    }
}
