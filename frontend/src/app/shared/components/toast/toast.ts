import { Component, inject } from '@angular/core';
import { ToastMsg, ToastService } from '../../../core/services/toast.service';

const ICONE_POR_SEVERIDADE: Record<ToastMsg['severity'], string> = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    warn: 'fa-triangle-exclamation',
    info: 'fa-circle-info',
};

@Component({
    selector: 'app-toast',
    template: `
        <div class="toast-container">
            @for (msg of toast.mensagens(); track msg) {
                <div class="toast-item" [class]="'toast-item--' + msg.severity">
                    <i class="fas" [class]="iconeDe(msg)"></i>
                    <div class="toast-item__texto">
                        <strong>{{ msg.summary }}</strong>
                        <span>{{ msg.detail }}</span>
                    </div>
                    <button type="button" class="toast-item__fechar" (click)="toast.fechar(msg)" aria-label="Fechar">
                        <i class="fas fa-xmark"></i>
                    </button>
                </div>
            }
        </div>
    `,
    styleUrl: './toast.scss',
})
export class Toast {
    toast = inject(ToastService);

    iconeDe(msg: ToastMsg): string {
        return ICONE_POR_SEVERIDADE[msg.severity];
    }
}
