<?php

namespace Tests\Feature;

use App\Models\Pedido;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class InfinitePayWebhookTest extends TestCase
{
    use RefreshDatabase;

    private function criarPedidoAguardando(string $orderNsu): Pedido
    {
        return Pedido::create([
            'token_acompanhamento' => (string) \Illuminate\Support\Str::uuid(),
            'nome_cliente' => 'Cliente Teste',
            'telefone_cliente' => '61999998888',
            'endereco' => 'Rua Teste, 123',
            'frete_a_combinar' => false,
            'valor_total' => 200,
            'status' => 'AGUARDANDO',
            'infinitepay_order_nsu' => $orderNsu,
        ]);
    }

    public function test_confirma_pagamento_via_pix(): void
    {
        $pedido = $this->criarPedidoAguardando('pedido-1-abc123');

        Http::fake([
            '*/payment_check' => Http::response(['success' => true, 'paid' => true, 'capture_method' => 'pix'], 200),
        ]);

        $resposta = $this->postJson('/api/webhooks/infinitepay', [
            'order_nsu' => 'pedido-1-abc123',
            'transaction_nsu' => 'txn-999',
            'invoice_slug' => 'slug-999',
            'capture_method' => 'pix',
        ]);

        $resposta->assertOk();
        $resposta->assertJson(['success' => true]);

        $pedido->refresh();
        $this->assertSame('PAGO', $pedido->status);
        $this->assertSame('PIX', $pedido->metodo_pagamento);
        $this->assertSame('txn-999', $pedido->infinitepay_transaction_nsu);
        $this->assertSame('slug-999', $pedido->infinitepay_slug);
    }

    public function test_confirma_pagamento_via_cartao_quando_capture_method_nao_e_pix(): void
    {
        $pedido = $this->criarPedidoAguardando('pedido-2-xyz');

        Http::fake([
            '*/payment_check' => Http::response(['success' => true, 'paid' => true, 'capture_method' => 'credit_card'], 200),
        ]);

        $this->postJson('/api/webhooks/infinitepay', [
            'order_nsu' => 'pedido-2-xyz',
            'capture_method' => 'credit_card',
        ])->assertOk();

        $this->assertSame('CARTAO', $pedido->fresh()->metodo_pagamento);
    }

    public function test_rejeita_chamada_forjada_que_nunca_passou_pela_infinitepay(): void
    {
        $pedido = $this->criarPedidoAguardando('pedido-4-forjado');

        // simula um atacante chutando o order_nsu sem nunca ter pago de verdade -
        // a InfinitePay confirma que NAO esta pago (paid: false).
        Http::fake([
            '*/payment_check' => Http::response(['success' => true, 'paid' => false], 200),
        ]);

        $resposta = $this->postJson('/api/webhooks/infinitepay', [
            'order_nsu' => 'pedido-4-forjado',
            'capture_method' => 'pix',
        ]);

        $resposta->assertStatus(402);
        $resposta->assertJson(['success' => false]);
        $this->assertSame('AGUARDANDO', $pedido->fresh()->status);
    }

    public function test_e_idempotente_nao_reprocessa_pedido_ja_pago(): void
    {
        $pedido = $this->criarPedidoAguardando('pedido-3-jah-pago');
        $pedido->update(['status' => 'PAGO', 'metodo_pagamento' => 'PIX']);

        $resposta = $this->postJson('/api/webhooks/infinitepay', [
            'order_nsu' => 'pedido-3-jah-pago',
            'capture_method' => 'credit_card',
        ]);

        $resposta->assertOk();

        // status/metodo continuam os originais - o webhook nao reprocessou como CARTAO.
        $this->assertSame('PAGO', $pedido->fresh()->status);
        $this->assertSame('PIX', $pedido->fresh()->metodo_pagamento);
    }

    public function test_rejeita_quando_order_nsu_nao_e_enviado(): void
    {
        $resposta = $this->postJson('/api/webhooks/infinitepay', [
            'capture_method' => 'pix',
        ]);

        $resposta->assertStatus(400);
        $resposta->assertJson(['success' => false]);
    }

    public function test_rejeita_quando_pedido_nao_existe_para_o_order_nsu(): void
    {
        $resposta = $this->postJson('/api/webhooks/infinitepay', [
            'order_nsu' => 'nao-existe-esse-pedido',
            'capture_method' => 'pix',
        ]);

        $resposta->assertStatus(400);
        $resposta->assertJson(['success' => false]);
    }
}
