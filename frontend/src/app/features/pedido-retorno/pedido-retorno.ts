import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PedidoService, StatusPedidoResposta } from '../../core/services/pedido.service';
import { SITE_INFO } from '../../core/constants/site-info';

type EstadoRetorno = 'verificando' | 'pago' | 'pendente' | 'erro';

@Component({
    selector: 'app-pedido-retorno',
    imports: [RouterLink],
    templateUrl: './pedido-retorno.html',
    styleUrl: './pedido-retorno.scss',
})
export class PedidoRetorno implements OnInit {
    private route = inject(ActivatedRoute);
    private pedidoService = inject(PedidoService);

    info = SITE_INFO;
    estado = signal<EstadoRetorno>('verificando');
    pedidoId = signal<number | null>(null);
    pedido = signal<StatusPedidoResposta | null>(null);

    /** Numero de tentativas de polling antes de desistir e mostrar "pendente". */
    private readonly MAX_TENTATIVAS = 5;
    private tentativas = 0;

    ngOnInit(): void {
        const idParam = this.route.snapshot.queryParamMap.get('pedido');
        const id = idParam ? Number(idParam) : null;

        if (!id) {
            this.estado.set('erro');
            return;
        }

        this.pedidoId.set(id);
        this.checarStatus(id);
    }

    private checarStatus(id: number): void {
        this.pedidoService.verificarStatus(id).subscribe({
            next: (resposta) => {
                this.pedido.set(resposta);

                if (resposta.status === 'PAGO') {
                    this.estado.set('pago');
                    return;
                }

                this.tentativas++;
                if (this.tentativas >= this.MAX_TENTATIVAS) {
                    this.estado.set('pendente');
                    return;
                }

                setTimeout(() => this.checarStatus(id), 3000);
            },
            error: () => this.estado.set('erro'),
        });
    }

    get linkWhatsapp(): string {
        const pedido = this.pedidoId();
        const texto = encodeURIComponent(
            pedido
                ? `Olá! Tenho uma dúvida sobre o meu pedido #${pedido}.`
                : `Olá! Tenho uma dúvida sobre meu pedido.`,
        );
        return `https://wa.me/${this.info.phoneWhatsapp}?text=${texto}`;
    }
}
