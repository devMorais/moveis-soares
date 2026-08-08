export interface CidadeEntrega {
    id: number;
    nomeCidade: string;
    uf: string;
    valorFrete: number;
    prazoDiasEstimado: number | null;
    ehRetiradaLocal: boolean;
}
