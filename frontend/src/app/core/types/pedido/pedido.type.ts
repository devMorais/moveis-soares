export type StatusPedido = 'AGUARDANDO' | 'PAGO' | 'EM_PREPARACAO' | 'ENVIADO' | 'ENTREGUE';

export interface PedidoItem {
    nomeProduto: string;
    precoUnitario: number;
    quantidade: number;
}

export interface Pedido {
    id: number;
    nomeCliente: string;
    telefoneCliente: string;
    endereco: string;
    cidade: string;
    freteACombinar: boolean;
    valorFrete: number | null;
    valorTotal: number;
    status: StatusPedido;
    metodoPagamento: string | null;
    itens: PedidoItem[];
    criadoEm: string;
}
