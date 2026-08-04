export interface Produto {
    id: number;
    nome: string;
    categoria: string;
    precoDe?: number;
    preco: number;
    imagemUrl: string;
    /** Linha curta de especificação, ex: "4 PORTAS | 2 GAVETAS" */
    especificacao?: string;
    /** Selo do card/hero, ex: "Lançamento", "Oferta" */
    selo?: string;
}
