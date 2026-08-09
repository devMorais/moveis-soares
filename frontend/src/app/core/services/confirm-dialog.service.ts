import { Injectable, signal } from '@angular/core';

export interface ConfirmConfig {
    titulo: string;
    mensagem: string;
    textoConfirmar?: string;
    textoCancelar?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
    pedido = signal<ConfirmConfig | null>(null);

    private resolver: ((confirmado: boolean) => void) | null = null;

    confirmar(config: ConfirmConfig): Promise<boolean> {
        this.pedido.set(config);
        return new Promise((resolve) => {
            this.resolver = resolve;
        });
    }

    responder(confirmado: boolean): void {
        this.resolver?.(confirmado);
        this.resolver = null;
        this.pedido.set(null);
    }
}
