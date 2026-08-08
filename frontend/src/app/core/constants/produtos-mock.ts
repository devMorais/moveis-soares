import { Produto } from '../types/produto/produto.type';

/**
 * Dados de demonstração para o MVP — serão substituídos pelo catálogo real
 * cadastrado no painel (ver MS-10) assim que o módulo de produtos existir.
 */
export const PRODUTOS_MOCK: Produto[] = [
    {
        id: 1,
        nome: 'Guarda-Roupa Off-White 6 Portas',
        categoria: 'Quarto',
        precoDe: 1899,
        preco: 1599,
        imagemUrl: 'assets/images/produtos/guarda-roupa-off-white-6-portas.webp',
        especificacao: '6 PORTAS | ACABAMENTO OFF-WHITE',
        selo: 'Lançamento',
    },
    {
        id: 2,
        nome: 'Buffet Amêndoa',
        categoria: 'Sala',
        precoDe: 1299,
        preco: 999,
        imagemUrl: 'assets/images/produtos/buffet-amendoa.webp',
        especificacao: '4 PORTAS | TAMPO LAQUEADO',
        selo: 'Oferta',
    },
    {
        id: 3,
        nome: 'Guarda-Roupa 4 Portas',
        categoria: 'Quarto',
        preco: 1499,
        imagemUrl: 'assets/images/produtos/guarda-roupa-classico-4-portas.webp',
        especificacao: '4 PORTAS | ACABAMENTO NOGAL',
    },
    {
        id: 4,
        nome: 'Guarda-Roupa Glossy 4 Portas',
        categoria: 'Quarto',
        precoDe: 1799,
        preco: 1499,
        imagemUrl: 'assets/images/produtos/guarda-roupa-glossy-4-portas.webp',
        especificacao: '4 PORTAS | ACABAMENTO GLOSSY',
        selo: 'Oferta',
    },
    {
        id: 5,
        nome: 'Guarda-Roupa 3 Portas com Gavetas',
        categoria: 'Quarto',
        preco: 1299,
        imagemUrl: 'assets/images/produtos/guarda-roupa-3-portas-2-gavetas.webp',
        especificacao: '3 PORTAS | 2 GAVETAS',
    },
];
