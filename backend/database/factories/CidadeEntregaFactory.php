<?php

namespace Database\Factories;

use App\Models\CidadeEntrega;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CidadeEntrega>
 */
class CidadeEntregaFactory extends Factory
{
    protected $model = CidadeEntrega::class;

    public function definition(): array
    {
        return [
            'nome_cidade' => fake()->unique()->city(),
            'uf' => 'DF',
            'valor_frete' => 50,
            'prazo_dias_estimado' => 5,
            'eh_retirada_local' => false,
            'ativo' => true,
        ];
    }
}
