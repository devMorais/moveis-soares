<?php

namespace Tests\Feature;

use App\Models\CidadeEntrega;
use App\Models\Pedido;
use App\Models\Produto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PedidoCriarTest extends TestCase
{
    use RefreshDatabase;

    private function payloadBase(Produto $produto, int $quantidade = 1): array
    {
        return [
            'nome_cliente' => 'Cliente Teste',
            'telefone_cliente' => '61999998888',
            'endereco' => 'Rua Teste, 123',
            'frete_a_combinar' => false,
            'itens' => [
                ['produto_id' => $produto->id, 'quantidade' => $quantidade],
            ],
        ];
    }

    public function test_cria_pedido_desconta_estoque_calcula_frete_e_gera_link_de_pagamento(): void
    {
        Http::fake([
            '*/links' => Http::response(['url' => 'https://checkout.infinitepay.io/loja?lenc=abc', 'slug' => 'abc123'], 200),
        ]);

        $cidade = CidadeEntrega::factory()->create(['valor_frete' => 40]);
        $produto = Produto::factory()->create(['preco' => 100, 'estoque' => 5]);

        $payload = $this->payloadBase($produto, 2);
        $payload['cidade_entrega_id'] = $cidade->id;

        $resposta = $this->postJson('/api/pedidos', $payload);

        $resposta->assertOk();
        $resposta->assertJson(['link' => 'https://checkout.infinitepay.io/loja?lenc=abc']);

        $this->assertDatabaseCount('pedidos', 1);

        $pedido = Pedido::first();
        $this->assertSame('AGUARDANDO', $pedido->status);
        $this->assertEquals(240, $pedido->valor_total); // 2x100 + 40 de frete
        $this->assertEquals(40, $pedido->valor_frete);
        $this->assertSame('abc123', $pedido->infinitepay_slug);
        $this->assertNotNull($pedido->infinitepay_link);

        $this->assertEquals(3, $produto->fresh()->estoque); // 5 - 2
    }

    public function test_nao_cria_pedido_quando_estoque_insuficiente(): void
    {
        $produto = Produto::factory()->create(['estoque' => 1]);

        $resposta = $this->postJson('/api/pedidos', $this->payloadBase($produto, 5));

        $resposta->assertStatus(422);
        $this->assertDatabaseCount('pedidos', 0);
        $this->assertEquals(1, $produto->fresh()->estoque);
    }

    public function test_reverte_estoque_e_marca_falhou_quando_infinitepay_nao_gera_link(): void
    {
        Http::fake([
            '*/links' => Http::response(['message' => 'handle invalido'], 400),
        ]);

        $produto = Produto::factory()->create(['estoque' => 5]);

        $resposta = $this->postJson('/api/pedidos', $this->payloadBase($produto, 2));

        $resposta->assertStatus(502);

        $pedido = Pedido::first();
        $this->assertNotNull($pedido, 'O pedido deveria ter sido criado antes de tentar gerar o link.');
        $this->assertSame('FALHOU', $pedido->status);

        // estoque decrementado (5 -> 3) e depois devolvido (3 -> 5), sem vazar.
        $this->assertEquals(5, $produto->fresh()->estoque);
    }

    public function test_nao_permite_pedido_sem_itens(): void
    {
        $payload = $this->payloadBase(Produto::factory()->create());
        $payload['itens'] = [];

        $resposta = $this->postJson('/api/pedidos', $payload);

        $resposta->assertStatus(422);
        $this->assertDatabaseCount('pedidos', 0);
    }
}
