import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PedidoAdminService } from '../../../core/services/pedido-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Pedido, StatusPedido } from '../../../core/types/pedido/pedido.type';

@Component({
    selector: 'app-admin-pedidos',
    imports: [FormsModule],
    templateUrl: './pedidos.html',
    styleUrl: './pedidos.scss',
})
export class Pedidos implements OnInit {
    private pedidosService = inject(PedidoAdminService);
    private toast = inject(ToastService);

    readonly statusOpcoes: StatusPedido[] = ['AGUARDANDO', 'PAGO', 'EM_PREPARACAO', 'ENVIADO', 'ENTREGUE'];

    pedidos = signal<Pedido[]>([]);
    carregando = signal(true);
    filtroStatus = signal<StatusPedido | null>(null);
    expandidoId = signal<number | null>(null);

    ngOnInit(): void {
        this.carregar();
    }

    carregar(): void {
        this.carregando.set(true);
        this.pedidosService.listar(this.filtroStatus()).subscribe({
            next: (pedidos) => {
                this.pedidos.set(pedidos);
                this.carregando.set(false);
            },
            error: () => this.carregando.set(false),
        });
    }

    filtrarPor(status: StatusPedido | null): void {
        this.filtroStatus.set(status);
        this.carregar();
    }

    alternarDetalhe(pedido: Pedido): void {
        this.expandidoId.set(this.expandidoId() === pedido.id ? null : pedido.id);
    }

    mudarStatus(pedido: Pedido, novoStatus: string): void {
        const status = novoStatus as StatusPedido;
        if (status === pedido.status) return;

        this.pedidosService.atualizarStatus(pedido.id, status).subscribe({
            next: (atualizado) => {
                this.pedidos.update((atuais) => atuais.map((p) => (p.id === atualizado.id ? atualizado : p)));
                this.toast.sucesso('Status do pedido atualizado.');
            },
            error: () => this.toast.erro('Não foi possível atualizar o status.'),
        });
    }

    rotuloStatus(status: StatusPedido): string {
        const rotulos: Record<StatusPedido, string> = {
            AGUARDANDO: 'Aguardando pagamento',
            PAGO: 'Pago',
            EM_PREPARACAO: 'Em preparação',
            ENVIADO: 'Enviado',
            ENTREGUE: 'Entregue',
        };
        return rotulos[status];
    }
}
