import { Component, computed, inject } from '@angular/core';
import { SiteService } from '../../../../core/services/site.service';

@Component({
    selector: 'app-whatsapp-fab',
    template: `
        <a
            class="whatsapp-float"
            [href]="'https://wa.me/' + telefoneWhatsapp() + '?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20m%C3%B3veis.'"
            target="_blank"
            rel="noopener"
            aria-label="Fale conosco pelo WhatsApp"
        >
            <i class="fab fa-whatsapp"></i>
        </a>
    `,
    styles: [`
        .whatsapp-float {
            position: fixed;
            right: 25px;
            bottom: 25px;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #25d366;
            color: #fff;
            font-size: 30px;
            border-radius: 50%;
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.4);
            z-index: 999;
            animation: whatsapp-pulse 2s infinite;
        }

        @keyframes whatsapp-pulse {
            0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5); }
            70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
            100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }
    `],
})
export class WhatsappFab {
    private site = inject(SiteService);

    telefoneWhatsapp = computed(() => this.site.conteudo().contato?.telefoneWhatsapp);
}
