export type StatusPedido = 'AGUARDANDO' | 'PAGO' | 'EM_PREPARACAO' | 'ENVIADO' | 'ENTREGUE';

export interface PedidoItem {
    nomeProduto: string;
    precoUnitario: number;
    quantidade: number;
    imagemUrl: string | null;
    produtoSlug: string | null;
}

export interface PedidoAtendente {
    id: number;
    name: string;
}

export interface Pedido {
    id: number;
    tokenAcompanhamento: string | null;
    nomeCliente: string;
    telefoneCliente: string;
    endereco: string;
    observacoes: string | null;
    cidade: string;
    freteACombinar: boolean;
    valorFrete: number | null;
    valorTotal: number;
    status: StatusPedido;
    atendente: PedidoAtendente | null;
    metodoPagamento: string | null;
    itens: PedidoItem[];
    criadoEm: string;
}
