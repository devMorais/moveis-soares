import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { PedidoAdminService } from '../../../core/services/pedido-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { ClipboardService } from '../../../core/services/clipboard.service';
import { AuthService } from '../../../core/services/auth.service';
import { Pedido, StatusPedido } from '../../../core/types/pedido/pedido.type';
import { Datatable } from '../../../shared/components/datatable/datatable';

const ROTULOS_STATUS: Record<StatusPedido, string> = {
    AGUARDANDO: 'Aguardando pagamento',
    PAGO: 'Pago',
    EM_PREPARACAO: 'Em preparação',
    ENVIADO: 'Enviado',
    ENTREGUE: 'Entregue',
    FALHOU: 'Falha no pagamento',
};

@Component({
    selector: 'app-admin-pedidos',
    imports: [FormsModule, Datatable],
    templateUrl: './pedidos.html',
    styleUrl: './pedidos.scss',
})
export class Pedidos implements OnInit {
    private pedidosService = inject(PedidoAdminService);
    private toast = inject(ToastService);
    private clipboard = inject(ClipboardService);
    private auth = inject(AuthService);

    readonly statusOpcoes: StatusPedido[] = ['AGUARDANDO', 'PAGO', 'EM_PREPARACAO', 'ENVIADO', 'ENTREGUE', 'FALHOU'];

    pedidos = signal<Pedido[]>([]);
    carregando = signal(true);
    filtroStatus = signal<StatusPedido | null>(null);
    pedidoSelecionado = signal<Pedido | null>(null);

    colunas: ColDef<Pedido>[] = [
        { field: 'id', headerName: '#', width: 90, sortable: true, valueFormatter: (p) => `#${p.value}` },
        { field: 'nomeCliente', headerName: 'Cliente', flex: 2, sortable: true, filter: true },
        { field: 'telefoneCliente', headerName: 'Telefone', flex: 1, sortable: true, filter: true },
        { field: 'cidade', headerName: 'Cidade', flex: 1, sortable: true, filter: true },
        {
            headerName: 'Frete',
            flex: 1,
            minWidth: 150,
            sortable: false,
            filter: false,
            cellRenderer: (params: { data?: Pedido }) =>
                params.data?.freteACombinar
                    ? `<span class="badge-frete-combinar"><i class="fas fa-triangle-exclamation"></i> A combinar</span>`
                    : '',
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            minWidth: 180,
            sortable: true,
            filter: true,
            cellRenderer: (params: { value: StatusPedido }) =>
                `<span class="badge-status" data-status="${params.value}">${ROTULOS_STATUS[params.value]}</span>`,
        },
        {
            field: 'valorTotal',
            headerName: 'Valor',
            flex: 1,
            minWidth: 110,
            sortable: true,
            valueFormatter: (params) => `R$ ${params.value}`,
        },
        {
            headerName: 'Atendente',
            flex: 1,
            minWidth: 140,
            sortable: false,
            filter: false,
            valueGetter: (params) => params.data?.atendente?.name ?? '—',
        },
        {
            headerName: '',
            flex: 1,
            sortable: false,
            filter: false,
            cellRenderer: () => `
                <div class="acoes-celula">
                    <button type="button" class="acoes-celula__btn" data-acao="detalhe" aria-label="Ver detalhes"><i class="fas fa-eye"></i></button>
                </div>
            `,
            onCellClicked: (event) => {
                if (event.data) this.abrirDetalhe(event.data);
            },
        },
    ];

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
            error: () => {
                this.carregando.set(false);
                this.toast.erro('Não foi possível carregar os pedidos.');
            },
        });
    }

    filtrarPor(status: StatusPedido | null): void {
        this.filtroStatus.set(status);
        this.carregar();
    }

    abrirDetalhe(pedido: Pedido): void {
        this.pedidoSelecionado.set(pedido);
    }

    fecharDetalhe(): void {
        this.pedidoSelecionado.set(null);
    }

    mudarStatus(pedido: Pedido, novoStatus: string): void {
        const status = novoStatus as StatusPedido;
        if (status === pedido.status) return;

        this.pedidosService.atualizarStatus(pedido.id, status).subscribe({
            next: (atualizado) => {
                this.pedidos.update((atuais) => atuais.map((p) => (p.id === atualizado.id ? atualizado : p)));
                this.pedidoSelecionado.set(atualizado);
                this.toast.sucesso('Status do pedido atualizado.');
            },
            error: () => this.toast.erro('Não foi possível atualizar o status.'),
        });
    }

    rotuloStatus(status: StatusPedido): string {
        return ROTULOS_STATUS[status];
    }

    assumirAtendimento(pedido: Pedido): void {
        this.pedidosService.assumirAtendimento(pedido.id).subscribe({
            next: (atualizado) => {
                this.pedidos.update((atuais) => atuais.map((p) => (p.id === atualizado.id ? atualizado : p)));
                this.pedidoSelecionado.set(atualizado);
                this.toast.sucesso('Você assumiu o atendimento deste pedido.');
            },
            error: () => this.toast.erro('Não foi possível assumir o atendimento.'),
        });
    }

    linkAcompanhamento(pedido: Pedido): string {
        return `${window.location.origin}/pedido/acompanhar/${pedido.tokenAcompanhamento}`;
    }

    copiarLinkAcompanhamento(pedido: Pedido): void {
        this.clipboard.copiar(this.linkAcompanhamento(pedido), 'Link de acompanhamento copiado.');
    }

    linkWhatsappCliente(pedido: Pedido): string {
        const atendente = this.auth.currentUser()?.name ?? 'Móveis Soares';
        const texto = encodeURIComponent(
            `Olá ${pedido.nomeCliente}! Aqui é ${atendente}, da Móveis Soares, sobre seu pedido #${pedido.id}. ` +
                `Você pode acompanhar em tempo real por aqui: ${this.linkAcompanhamento(pedido)}`,
        );
        return `https://wa.me/${pedido.telefoneCliente}?text=${texto}`;
    }
}
