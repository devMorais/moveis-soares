import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'success' | 'error' | 'warn' | 'info';

export interface ToastMsg {
    severity: ToastSeverity;
    summary: string;
    detail: string;
    life: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    mensagens = signal<ToastMsg[]>([]);

    private mostrar(msg: ToastMsg): void {
        this.mensagens.update((atuais) => [...atuais, msg]);
        setTimeout(() => this.fechar(msg), msg.life);
    }

    fechar(msg: ToastMsg): void {
        this.mensagens.update((atuais) => atuais.filter((m) => m !== msg));
    }

    sucesso(mensagem: string, titulo = 'Sucesso') {
        this.mostrar({ severity: 'success', summary: titulo, detail: mensagem, life: 4000 });
    }

    erro(mensagem: string, titulo = 'Erro') {
        this.mostrar({ severity: 'error', summary: titulo, detail: mensagem, life: 4000 });
    }

    aviso(mensagem: string, titulo = 'Atenção') {
        this.mostrar({ severity: 'warn', summary: titulo, detail: mensagem, life: 4000 });
    }

    info(mensagem: string, titulo = 'Informação') {
        this.mostrar({ severity: 'info', summary: titulo, detail: mensagem, life: 4000 });
    }
}
