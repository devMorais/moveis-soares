export interface Categoria {
    slug: string;
    nome: string;
    imagemUrl: string;
}

/**
 * Preview de cada categoria usando fotos reais do catálogo (ver MS-02).
 * Quando o módulo de produtos existir (MS-10), a imagem passa a ser a
 * do produto mais recente cadastrado naquela categoria.
 */
export const CATEGORIAS: Categoria[] = [
    { slug: 'quarto', nome: 'Quarto', imagemUrl: 'assets/images/produtos/guarda-roupa-off-white-6-portas.webp' },
    { slug: 'sala', nome: 'Sala', imagemUrl: 'assets/images/produtos/buffet-amendoa.webp' },
    { slug: 'escritorio', nome: 'Escritório', imagemUrl: 'assets/images/produtos/guarda-roupa-classico-4-portas.webp' },
    { slug: 'cozinha', nome: 'Cozinha', imagemUrl: 'assets/images/produtos/guarda-roupa-glossy-4-portas.webp' },
];
