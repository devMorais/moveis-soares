<?php

namespace Database\Seeders;

use App\Models\CidadeEntrega;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Produto;
use Illuminate\Database\Seeder;

/**
 * Pedidos de exemplo cobrindo os 5 status do painel (MS-PED-05), incluindo
 * um caso de frete "a combinar" e um de retirada local - dados fake pra
 * teste manual, não roda em produção.
 */
class PedidoDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (Pedido::count() > 0) {
            return;
        }

        $brasilia = CidadeEntrega::where('nome_cidade', 'Brasília')->first();
        $taguatinga = CidadeEntrega::where('nome_cidade', 'Taguatinga')->first();
        $retirada = CidadeEntrega::where('eh_retirada_local', true)->first();

        if (! $brasilia || ! $taguatinga || ! $retirada) {
            return;
        }

        $produto = fn (string $slug) => Produto::where('slug', $slug)->first();

        $sofa = $produto('sofa-rose-curvo-3-lugares');
        $mesaJantar = $produto('mesa-de-jantar-6-lugares-preta');
        $comoda = $produto('comoda-rustica-6-gavetas');
        $criadoMudo = $produto('criado-mudo-amendoa');
        $cadeiraEscritorio = $produto('cadeira-giratoria-verde-agua');
        $cadeiraCozinha = $produto('cadeira-de-cozinha-madeira-clara');
        $rackTv = $produto('rack-para-tv-ate-55-nordic');

        if (! $sofa || ! $mesaJantar || ! $comoda || ! $criadoMudo || ! $cadeiraEscritorio || ! $cadeiraCozinha || ! $rackTv) {
            return;
        }

        $pedidos = [
            [
                'nome_cliente' => 'Marina Costa',
                'telefone_cliente' => '61991234567',
                'endereco' => 'SQN 210 Bloco C Apto 302',
                'cidade_entrega_id' => $brasilia->id,
                'frete_a_combinar' => false,
                'valor_frete' => $brasilia->valor_frete,
                'status' => 'AGUARDANDO',
                'metodo_pagamento' => null,
                'itens' => [[$sofa, 1]],
            ],
            [
                'nome_cliente' => 'Ricardo Almeida',
                'telefone_cliente' => '61992345678',
                'endereco' => 'QNM 15 Conjunto 8 Casa 12',
                'cidade_entrega_id' => null,
                'cidade_texto_livre' => 'Planaltina',
                'frete_a_combinar' => true,
                'valor_frete' => null,
                'status' => 'AGUARDANDO',
                'metodo_pagamento' => null,
                'itens' => [[$mesaJantar, 1], [$cadeiraCozinha, 6]],
            ],
            [
                'nome_cliente' => 'Fernanda Oliveira',
                'telefone_cliente' => '61993456789',
                'endereco' => 'Rua 5 Chácara 20, Taguatinga Sul',
                'cidade_entrega_id' => $taguatinga->id,
                'frete_a_combinar' => false,
                'valor_frete' => $taguatinga->valor_frete,
                'status' => 'PAGO',
                'metodo_pagamento' => 'PIX',
                'itens' => [[$comoda, 1], [$criadoMudo, 2]],
            ],
            [
                'nome_cliente' => 'João Pedro Santos',
                'telefone_cliente' => '61994567890',
                'endereco' => 'Retirada na loja - SIA Trecho 3',
                'cidade_entrega_id' => $retirada->id,
                'frete_a_combinar' => false,
                'valor_frete' => 0,
                'status' => 'EM_PREPARACAO',
                'metodo_pagamento' => 'CARTAO',
                'itens' => [[$cadeiraEscritorio, 1]],
            ],
            [
                'nome_cliente' => 'Beatriz Lima',
                'telefone_cliente' => '61995678901',
                'endereco' => 'SHIS QI 11 Conjunto 4 Casa 7, Lago Sul',
                'cidade_entrega_id' => $brasilia->id,
                'frete_a_combinar' => false,
                'valor_frete' => $brasilia->valor_frete,
                'status' => 'ENVIADO',
                'metodo_pagamento' => 'PIX',
                'itens' => [[$rackTv, 1]],
            ],
            [
                'nome_cliente' => 'Carlos Eduardo Mendes',
                'telefone_cliente' => '61996789012',
                'endereco' => 'Quadra 12 Lote 8, Taguatinga Norte',
                'cidade_entrega_id' => $taguatinga->id,
                'frete_a_combinar' => false,
                'valor_frete' => $taguatinga->valor_frete,
                'status' => 'ENTREGUE',
                'metodo_pagamento' => 'CARTAO',
                'itens' => [[$criadoMudo, 1], [$cadeiraCozinha, 4]],
            ],
        ];

        foreach ($pedidos as $dados) {
            $valorTotal = (float) ($dados['valor_frete'] ?? 0);
            $itensParaCriar = [];

            foreach ($dados['itens'] as [$item, $quantidade]) {
                $valorTotal += (float) $item->preco * $quantidade;
                $itensParaCriar[] = [
                    'produto_id' => $item->id,
                    'nome_produto' => $item->nome,
                    'preco_unitario' => $item->preco,
                    'quantidade' => $quantidade,
                ];
            }

            $pedido = Pedido::create([
                'nome_cliente' => $dados['nome_cliente'],
                'telefone_cliente' => $dados['telefone_cliente'],
                'endereco' => $dados['endereco'],
                'cidade_entrega_id' => $dados['cidade_entrega_id'],
                'cidade_texto_livre' => $dados['cidade_texto_livre'] ?? null,
                'frete_a_combinar' => $dados['frete_a_combinar'],
                'valor_frete' => $dados['valor_frete'],
                'valor_total' => $valorTotal,
                'status' => $dados['status'],
                'metodo_pagamento' => $dados['metodo_pagamento'],
            ]);

            foreach ($itensParaCriar as $item) {
                PedidoItem::create([...$item, 'pedido_id' => $pedido->id]);
            }
        }
    }
}
