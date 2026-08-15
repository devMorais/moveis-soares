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

    public function test_endpoint_de_destaques_so_traz_produtos_com_selo_e_nao_e_paginado(): void
    {
        $categoria = Categoria::factory()->create();
        Produto::factory()->count(3)->create(['categoria_id' => $categoria->id, 'selo' => null]);
        Produto::factory()->count(2)->create(['categoria_id' => $categoria->id, 'selo' => 'Oferta']);

        $resposta = $this->getJson('/api/produtos/destaques');

        $resposta->assertOk();
        $resposta->assertJsonCount(2);
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
