<?php

namespace Database\Seeders;

use App\Models\CidadeEntrega;
use Illuminate\Database\Seeder;

class CidadeEntregaSeeder extends Seeder
{
    public function run(): void
    {
        $cidades = [
            ['nome_cidade' => 'Retirada na loja', 'uf' => 'DF', 'valor_frete' => 0, 'prazo_dias_estimado' => 0, 'eh_retirada_local' => true],
            ['nome_cidade' => 'Brasília', 'uf' => 'DF', 'valor_frete' => 0, 'prazo_dias_estimado' => 3, 'eh_retirada_local' => false],
            ['nome_cidade' => 'Águas Claras', 'uf' => 'DF', 'valor_frete' => 0, 'prazo_dias_estimado' => 3, 'eh_retirada_local' => false],
            ['nome_cidade' => 'Taguatinga', 'uf' => 'DF', 'valor_frete' => 30, 'prazo_dias_estimado' => 4, 'eh_retirada_local' => false],
            ['nome_cidade' => 'Ceilândia', 'uf' => 'DF', 'valor_frete' => 40, 'prazo_dias_estimado' => 4, 'eh_retirada_local' => false],
            ['nome_cidade' => 'Águas Lindas de Goiás', 'uf' => 'GO', 'valor_frete' => 90, 'prazo_dias_estimado' => 6, 'eh_retirada_local' => false],
            ['nome_cidade' => 'Luziânia', 'uf' => 'GO', 'valor_frete' => 110, 'prazo_dias_estimado' => 7, 'eh_retirada_local' => false],
        ];

        foreach ($cidades as $cidade) {
            CidadeEntrega::updateOrCreate(
                ['nome_cidade' => $cidade['nome_cidade']],
                [...$cidade, 'ativo' => true]
            );
        }
    }
}
