export interface ItemCarrinho {
    produtoId: number;
    nome: string;
    slug?: string;
    imagemUrl: string;
    preco: number;
    quantidade: number;
    /** Snapshot do estoque no momento em que o item foi adicionado. */
    estoque?: number;
}
