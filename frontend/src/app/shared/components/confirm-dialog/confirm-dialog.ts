import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
    selector: 'app-confirm-dialog',
    template: `
        @if (dialog.pedido(); as p) {
            <div class="modal-fundo" (click)="dialog.responder(false)">
                <div class="modal-detalhe" (click)="$event.stopPropagation()">
                    <div class="modal-detalhe__topo">
                        <h2>{{ p.titulo }}</h2>
                        <button
                            type="button"
                            class="modal-detalhe__fechar"
                            (click)="dialog.responder(false)"
                            aria-label="Fechar"
                        >
                            <i class="fas fa-xmark"></i>
                        </button>
                    </div>

                    <p>{{ p.mensagem }}</p>

                    <div class="confirm-dialog__acoes">
                        <button type="button" class="btn-cancelar" (click)="dialog.responder(false)">
                            {{ p.textoCancelar ?? 'Cancelar' }}
                        </button>
                        <button type="button" class="btn-excluir" (click)="dialog.responder(true)">
                            {{ p.textoConfirmar ?? 'Excluir' }}
                        </button>
                    </div>
                </div>
            </div>
        }
    `,
    styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
    dialog = inject(ConfirmDialogService);
}
