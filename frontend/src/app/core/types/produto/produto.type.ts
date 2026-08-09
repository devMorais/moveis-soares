export interface Produto {
    id: number;
    nome: string;
    slug?: string;
    categoria: string;
    categoriaSlug?: string;
    descricao?: string;
    precoDe?: number;
    preco: number;
    imagemUrl: string;
    /** Demais fotos do produto, alem da principal (imagemUrl) - ver MS-CAT-02. */
    imagens?: string[];
    /** Linha curta de especificação, ex: "4 PORTAS | 2 GAVETAS" */
    especificacao?: string;
    /** Selo do card/hero, ex: "Lançamento", "Oferta" */
    selo?: string;
    estoque?: number;
    alturaCm?: number;
    larguraCm?: number;
    profundidadeCm?: number;
    ativo?: boolean;
    totalVisualizacoes?: number | null;
}
