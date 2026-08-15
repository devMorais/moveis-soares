<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\ConfiguracaoSite;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProdutoPaginacaoTest extends TestCase
{
    use RefreshDatabase;

    public function test_lista_publica_de_produtos_respeita_o_tamanho_de_pagina_configurado_pelo_admin(): void
    {
        ConfiguracaoSite::instancia()->update(['produtos_por_pagina' => 5]);
        $categoria = Categoria::factory()->create();
        Produto::factory()->count(12)->create(['categoria_id' => $categoria->id]);

        $resposta = $this->getJson('/api/produtos');

        $resposta->assertOk();
        $resposta->assertJsonCount(5, 'data');
        $resposta->assertJsonPath('total', 12);
        $resposta->assertJsonPath('last_page', 3);
        $resposta->assertJsonPath('per_page', 5);
    }

    public function test_pagina_2_devolve_os_proximos_itens(): void
    {
        ConfiguracaoSite::instancia()->update(['produtos_por_pagina' => 5]);
        $categoria = Categoria::factory()->create();
        Produto::factory()->count(12)->create(['categoria_id' => $categoria->id]);

        $resposta = $this->getJson('/api/produtos?page=2');

        $resposta->assertOk();
        $resposta->assertJsonCount(5, 'data');
        $resposta->assertJsonPath('current_page', 2);
    }

    public function test_filtro_por_categoria_via_query_param(): void
    {
        $quarto = Categoria::factory()->create(['nome' => 'Quarto', 'slug' => 'quarto']);
        $sala = Categoria::factory()->create(['nome' => 'Sala', 'slug' => 'sala']);
        Produto::factory()->count(3)->create(['categoria_id' => $quarto->id]);
        Produto::factory()->count(2)->create(['categoria_id' => $sala->id]);

        $resposta = $this->getJson('/api/produtos?categoria=quarto');

        $resposta->assertOk();
        $resposta->assertJsonPath('total', 3);
    }

    public function test_produto_inativo_nao_aparece_na_listagem_paginada(): void
    {
        $categoria = Categoria::factory()->create();
        Produto::factory()->create(['categoria_id' => $categoria->id, 'ativo' => true]);
        Produto::factory()->create(['categoria_id' => $categoria->id, 'ativo' => false]);

        $resposta = $this->getJson('/api/produtos');

        $resposta->assertJsonPath('total', 1);
    }

    public function test_endpoint_de_destaques_traz_os_10_ultimos_cadastrados_com_ou_sem_selo(): void
    {
        $categoria = Categoria::factory()->create();
        Produto::factory()->count(3)->create(['categoria_id' => $categoria->id, 'selo' => null]);
        Produto::factory()->count(2)->create(['categoria_id' => $categoria->id, 'selo' => 'Oferta']);

        $resposta = $this->getJson('/api/produtos/destaques');

        $resposta->assertOk();
        $resposta->assertJsonCount(5);
    }

    public function test_endpoint_de_destaques_limita_a_10_mesmo_com_mais_produtos(): void
    {
        $categoria = Categoria::factory()->create();
        Produto::factory()->count(15)->create(['categoria_id' => $categoria->id]);

        $resposta = $this->getJson('/api/produtos/destaques');

        $resposta->assertOk();
        $resposta->assertJsonCount(10);
    }

    public function test_ordenacao_alfabetica_configurada_pelo_admin(): void
    {
        ConfiguracaoSite::instancia()->update(['produtos_ordenacao' => 'alfabetica']);
        $categoria = Categoria::factory()->create();
        Produto::factory()->create(['categoria_id' => $categoria->id, 'nome' => 'Zebra']);
        Produto::factory()->create(['categoria_id' => $categoria->id, 'nome' => 'Abacaxi']);

        $resposta = $this->getJson('/api/produtos');

        $resposta->assertOk();
        $nomes = array_column($resposta->json('data'), 'nome');
        $this->assertSame(['Abacaxi', 'Zebra'], $nomes);
    }

    public function test_ordenacao_antigos_primeiro_configurada_pelo_admin(): void
    {
        ConfiguracaoSite::instancia()->update(['produtos_ordenacao' => 'antigos']);
        $categoria = Categoria::factory()->create();
        $primeiro = Produto::factory()->create(['categoria_id' => $categoria->id]);
        $segundo = Produto::factory()->create(['categoria_id' => $categoria->id]);

        $resposta = $this->getJson('/api/produtos');

        $resposta->assertOk();
        $ids = array_column($resposta->json('data'), 'id');
        $this->assertSame([$primeiro->id, $segundo->id], $ids);
    }

    public function test_categoria_produtos_tambem_respeita_a_ordenacao_configurada(): void
    {
        ConfiguracaoSite::instancia()->update(['produtos_ordenacao' => 'alfabetica']);
        $categoria = Categoria::factory()->create(['slug' => 'quarto']);
        Produto::factory()->create(['categoria_id' => $categoria->id, 'nome' => 'Zebra']);
        Produto::factory()->create(['categoria_id' => $categoria->id, 'nome' => 'Abacaxi']);

        $resposta = $this->getJson('/api/categorias/quarto/produtos');

        $resposta->assertOk();
        $nomes = array_column($resposta->json('data'), 'nome');
        $this->assertSame(['Abacaxi', 'Zebra'], $nomes);
    }

    public function test_admin_configura_ordenacao_do_catalogo(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $resposta = $this->putJson('/api/admin/configuracoes/seo', ['produtos_ordenacao' => 'alfabetica']);

        $resposta->assertOk();
        $resposta->assertJsonPath('produtosOrdenacao', 'alfabetica');
        $this->assertSame('alfabetica', ConfiguracaoSite::instancia()->fresh()->produtos_ordenacao);
    }

    public function test_admin_nao_consegue_configurar_ordenacao_invalida(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->putJson('/api/admin/configuracoes/seo', ['produtos_ordenacao' => 'qualquer-coisa'])
            ->assertStatus(422);
    }

    public function test_admin_configura_produtos_por_pagina(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $resposta = $this->putJson('/api/admin/configuracoes/seo', ['produtos_por_pagina' => 24]);

        $resposta->assertOk();
        $resposta->assertJsonPath('produtosPorPagina', 24);
        $this->assertSame(24, ConfiguracaoSite::instancia()->fresh()->produtos_por_pagina);
    }

    public function test_admin_nao_consegue_configurar_valor_absurdo(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->putJson('/api/admin/configuracoes/seo', ['produtos_por_pagina' => 1])
            ->assertStatus(422);

        $this->putJson('/api/admin/configuracoes/seo', ['produtos_por_pagina' => 500])
            ->assertStatus(422);
    }
}
