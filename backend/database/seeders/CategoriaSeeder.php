<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            [
                'nome' => 'Quarto',
                'slug' => 'quarto',
                'imagem_url' => 'assets/images/produtos/guarda-roupa-off-white-6-portas.jpg',
            ],
            [
                'nome' => 'Sala',
                'slug' => 'sala',
                'imagem_url' => 'assets/images/produtos/buffet-amendoa.jpg',
            ],
            [
                'nome' => 'Escritorio',
                'slug' => 'escritorio',
                'imagem_url' => 'assets/images/produtos/guarda-roupa-classico-4-portas.jpg',
            ],
            [
                'nome' => 'Cozinha',
                'slug' => 'cozinha',
                'imagem_url' => 'assets/images/produtos/guarda-roupa-glossy-4-portas.jpg',
            ],
        ];

        foreach ($categorias as $categoria) {
            Categoria::updateOrCreate(['slug' => $categoria['slug']], $categoria);
        }
    }
}
