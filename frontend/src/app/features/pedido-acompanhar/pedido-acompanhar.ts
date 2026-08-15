import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AcompanhamentoPedido, PedidoService } from '../../core/services/pedido.service';
import { SiteService } from '../../core/services/site.service';

type EstadoAcompanhamento = 'carregando' | 'ok' | 'erro';

const ETAPAS: { status: string; rotulo: string }[] = [
    { status: 'AGUARDANDO', rotulo: 'Aguardando pagamento' },
    { status: 'PAGO', rotulo: 'Pago' },
    { status: 'EM_PREPARACAO', rotulo: 'Em preparação' },
    { status: 'ENVIADO', rotulo: 'Enviado' },
    { status: 'ENTREGUE', rotulo: 'Entregue' },
];

const INTERVALO_ATUALIZACAO_MS = 15000;

@Component({
    selector: 'app-pedido-acompanhar',
    imports: [RouterLink, DatePipe],
    templateUrl: './pedido-acompanhar.html',
    styleUrl: './pedido-acompanhar.scss',
})
export class PedidoAcompanhar implements OnInit {
    private route = inject(ActivatedRoute);
    private pedidoService = inject(PedidoService);
    private site = inject(SiteService);

    readonly etapas = ETAPAS;

    estado = signal<EstadoAcompanhamento>('carregando');
    pedido = signal<AcompanhamentoPedido | null>(null);

    private token: string | null = null;

    ngOnInit(): void {
        this.token = this.route.snapshot.paramMap.get('token');

        if (!this.token) {
            this.estado.set('erro');
            return;
        }

        this.carregar(this.token);
    }

    private carregar(token: string): void {
        this.pedidoService.acompanharPorToken(token).subscribe({
            next: (pedido) => {
                this.pedido.set(pedido);
                this.estado.set('ok');
                setTimeout(() => this.carregar(token), INTERVALO_ATUALIZACAO_MS);
            },
            error: () => this.estado.set('erro'),
        });
    }

    indiceEtapaAtual(status: string): number {
        return this.etapas.findIndex((etapa) => etapa.status === status);
    }

    get linkWhatsapp(): string {
        const p = this.pedido();
        const texto = encodeURIComponent(
            p ? `Olá! Tenho uma dúvida sobre o meu pedido #${p.id}.` : `Olá! Tenho uma dúvida sobre meu pedido.`,
        );
        return `https://wa.me/${this.site.conteudo().contato?.telefoneWhatsapp}?text=${texto}`;
    }
}
