<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProdutoAdminCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_cria_produto(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $categoria = Categoria::factory()->create();

        $resposta = $this->postJson('/api/admin/produtos', [
            'categoria_id' => $categoria->id,
            'nome' => 'Sofá 3 Lugares',
            'preco' => 1500,
            'imagem_url' => 'https://moveis-soares.test/storage/produtos/foto.webp',
        ]);

        $resposta->assertCreated();
        $this->assertDatabaseHas('produtos', ['nome' => 'Sofá 3 Lugares', 'slug' => 'sofa-3-lugares']);
    }

    /**
     * MS-CAT-05: editar um produto ja cadastrado reenviando o mesmo
     * imagem_url (sem trocar a foto) tem que salvar normalmente, sem
     * exigir um novo upload -- e exatamente o que o frontend faz hoje.
     */
    public function test_atualiza_produto_reenviando_a_mesma_imagem_sem_trocar_foto(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $produto = Produto::factory()->create([
            'nome' => 'Guarda-Roupa Off-White',
            'preco' => 1000,
            'descricao' => 'Original',
        ]);

        $resposta = $this->putJson("/api/admin/produtos/{$produto->id}", [
            'categoria_id' => $produto->categoria_id,
            'nome' => $produto->nome,
            'preco' => 1200,
            'imagem_url' => $produto->imagem_url, // mesma foto, nao trocou
            'descricao' => 'Atualizado',
        ]);

        $resposta->assertOk();
        $produto->refresh();
        $this->assertEquals(1200, $produto->preco);
        $this->assertSame('Atualizado', $produto->descricao);
        $this->assertSame($produto->imagem_url, $resposta->json('imagemUrl'));
    }

    public function test_nao_atualiza_produto_sem_imagem_url(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $produto = Produto::factory()->create();

        $resposta = $this->putJson("/api/admin/produtos/{$produto->id}", [
            'categoria_id' => $produto->categoria_id,
            'nome' => $produto->nome,
            'preco' => 1200,
        ]);

        $resposta->assertStatus(422);
    }

    public function test_admin_pode_excluir_produto_sem_historico_de_pedidos(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $produto = Produto::factory()->create();

        $this->deleteJson("/api/admin/produtos/{$produto->id}")->assertOk();
        $this->assertDatabaseMissing('produtos', ['id' => $produto->id]);
    }

    public function test_nao_permite_excluir_produto_que_ja_apareceu_em_pedido(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $produto = Produto::factory()->create();

        $pedido = Pedido::create([
            'token_acompanhamento' => (string) \Illuminate\Support\Str::uuid(),
            'nome_cliente' => 'Cliente Teste',
            'telefone_cliente' => '61999998888',
            'endereco' => 'Rua Teste, 123',
            'frete_a_combinar' => false,
            'valor_total' => 100,
            'status' => 'PAGO',
        ]);
        PedidoItem::create([
            'pedido_id' => $pedido->id,
            'produto_id' => $produto->id,
            'nome_produto' => $produto->nome,
            'preco_unitario' => 100,
            'quantidade' => 1,
        ]);

        $resposta = $this->deleteJson("/api/admin/produtos/{$produto->id}");

        $resposta->assertStatus(422);
        $this->assertDatabaseHas('produtos', ['id' => $produto->id]);
    }
}
