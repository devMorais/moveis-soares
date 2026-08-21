<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConteudoInicioValidacaoTest extends TestCase
{
    use RefreshDatabase;

    private function comoAdmin(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
    }

    public function test_nao_salva_bloco_quem_somos_com_titulo_ou_texto_vazio(): void
    {
        $this->comoAdmin();

        $resposta = $this->putJson('/api/admin/conteudo/institucional', [
            'resumo_titulo' => '',
            'resumo_texto' => '',
            'itens' => [
                ['titulo' => 'A', 'texto' => 'B'],
                ['titulo' => 'A', 'texto' => 'B'],
                ['titulo' => 'A', 'texto' => 'B'],
            ],
        ]);

        $resposta->assertStatus(422);
        $this->assertArrayHasKey('resumo_titulo', $resposta->json('erros'));
        $this->assertArrayHasKey('resumo_texto', $resposta->json('erros'));
    }

    public function test_nao_salva_destaque_com_titulo_ou_texto_vazio(): void
    {
        $this->comoAdmin();

        $resposta = $this->putJson('/api/admin/conteudo/institucional', [
            'resumo_titulo' => 'Quem somos',
            'resumo_texto' => 'Texto resumido',
            'itens' => [
                ['titulo' => '', 'texto' => 'B'],
                ['titulo' => 'A', 'texto' => 'B'],
                ['titulo' => 'A', 'texto' => 'B'],
            ],
        ]);

        $resposta->assertStatus(422);
        $this->assertArrayHasKey('itens.0.titulo', $resposta->json('erros'));
    }

    public function test_salva_com_todos_os_campos_preenchidos(): void
    {
        $this->comoAdmin();

        $this->putJson('/api/admin/conteudo/institucional', [
            'resumo_titulo' => 'Quem somos',
            'resumo_texto' => 'Texto resumido',
            'itens' => [
                ['titulo' => 'Entrega', 'texto' => 'Combinada com você'],
                ['titulo' => 'Qualidade', 'texto' => 'Você vê'],
                ['titulo' => 'Atendimento', 'texto' => 'Próximo'],
            ],
        ])->assertOk();
    }

    public function test_nao_salva_banner_final_com_titulo_ou_texto_vazio(): void
    {
        $this->comoAdmin();

        $resposta = $this->putJson('/api/admin/conteudo-cta/home', [
            'titulo' => '',
            'texto' => 'Fale com a gente',
        ]);

        $resposta->assertStatus(422);
        $this->assertArrayHasKey('titulo', $resposta->json('erros'));
    }

    public function test_salva_banner_final_com_campos_preenchidos(): void
    {
        $this->comoAdmin();

        $this->putJson('/api/admin/conteudo-cta/home', [
            'titulo' => 'Pronto pra renovar sua casa?',
            'texto' => 'Fale agora com a nossa equipe.',
        ])->assertOk();
    }
}
