<?php

namespace Database\Factories;

use App\Models\Categoria;
use App\Models\Produto;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Produto>
 */
class ProdutoFactory extends Factory
{
    protected $model = Produto::class;

    public function definition(): array
    {
        $nome = fake()->unique()->words(3, true);

        return [
            'categoria_id' => Categoria::factory(),
            'nome' => ucfirst($nome),
            'slug' => Str::slug($nome),
            'preco' => fake()->randomFloat(2, 100, 3000),
            'imagem_url' => 'https://moveis-soares.test/storage/produtos/' . Str::uuid() . '.webp',
            'imagens' => [],
            'estoque' => 10,
            'ativo' => true,
        ];
    }
}
