import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
    private toast = inject(ToastService);

    async copiar(texto: string, mensagemSucesso = 'Link copiado.'): Promise<void> {
        try {
            await navigator.clipboard.writeText(texto);
            this.toast.sucesso(mensagemSucesso);
        } catch {
            this.toast.erro('Não foi possível copiar o link.');
        }
    }
}
