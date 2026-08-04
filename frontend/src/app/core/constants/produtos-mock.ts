import { Produto } from '../types/produto/produto.type';

/**
 * Dados de demonstração para o MVP — serão substituídos pelo catálogo real
 * cadastrado no painel (ver MS-10) assim que o módulo de produtos existir.
 */
export const PRODUTOS_MOCK: Produto[] = [
    {
        id: 1,
        nome: 'Cadeira Presidente Ergonômica',
        categoria: 'Escritório',
        precoDe: 899,
        preco: 699,
        imagemUrl: 'assets/images/produtos/cadeira-presidente.jpg',
    },
    {
        id: 2,
        nome: 'Guarda-Roupa 4 Portas',
        categoria: 'Quarto',
        preco: 1499,
        imagemUrl: 'assets/images/produtos/guarda-roupa-4-portas.jpg',
    },
    {
        id: 3,
        nome: 'Buffet Amêndoa',
        categoria: 'Sala',
        precoDe: 1299,
        preco: 999,
        imagemUrl: 'assets/images/produtos/buffet-amendoa.jpg',
    },
];
