<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Produto;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProdutoSeeder extends Seeder
{
    public function run(): void
    {
        $produtos = [
            [
                'categoria_slug' => 'quarto',
                'nome' => 'Guarda-Roupa Off-White 6 Portas',
                'preco_de' => 1899,
                'preco' => 1599,
                'imagem_url' => 'assets/images/produtos/guarda-roupa-off-white-6-portas.jpg',
                'especificacao' => '6 PORTAS | ACABAMENTO OFF-WHITE',
                'selo' => 'Lancamento',
            ],
            [
                'categoria_slug' => 'sala',
                'nome' => 'Buffet Amendoa',
                'preco_de' => 1299,
                'preco' => 999,
                'imagem_url' => 'assets/images/produtos/buffet-amendoa.jpg',
                'especificacao' => '4 PORTAS | TAMPO LAQUEADO',
                'selo' => 'Oferta',
            ],
            [
                'categoria_slug' => 'quarto',
                'nome' => 'Guarda-Roupa 4 Portas',
                'preco_de' => null,
                'preco' => 1499,
                'imagem_url' => 'assets/images/produtos/guarda-roupa-classico-4-portas.jpg',
                'especificacao' => '4 PORTAS | ACABAMENTO NOGAL',
                'selo' => null,
            ],
            [
                'categoria_slug' => 'quarto',
                'nome' => 'Guarda-Roupa Glossy 4 Portas',
                'preco_de' => 1799,
                'preco' => 1499,
                'imagem_url' => 'assets/images/produtos/guarda-roupa-glossy-4-portas.jpg',
                'especificacao' => '4 PORTAS | ACABAMENTO GLOSSY',
                'selo' => 'Oferta',
            ],
            [
                'categoria_slug' => 'quarto',
                'nome' => 'Guarda-Roupa 3 Portas com Gavetas',
                'preco_de' => null,
                'preco' => 1299,
                'imagem_url' => 'assets/images/produtos/guarda-roupa-3-portas-2-gavetas.jpg',
                'especificacao' => '3 PORTAS | 2 GAVETAS',
                'selo' => null,
            ],
        ];

        foreach ($produtos as $produto) {
            $categoria = Categoria::where('slug', $produto['categoria_slug'])->first();

            if (! $categoria) {
                continue;
            }

            Produto::updateOrCreate(
                ['slug' => Str::slug($produto['nome'])],
                [
                    'categoria_id' => $categoria->id,
                    'nome' => $produto['nome'],
                    'preco_de' => $produto['preco_de'],
                    'preco' => $produto['preco'],
                    'imagem_url' => $produto['imagem_url'],
                    'especificacao' => $produto['especificacao'],
                    'selo' => $produto['selo'],
                ]
            );
        }
    }
}
