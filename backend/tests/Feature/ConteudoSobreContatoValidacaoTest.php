<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConteudoSobreContatoValidacaoTest extends TestCase
{
    use RefreshDatabase;

    private function comoAdmin(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
    }

    private function diferenciaisValidos(): array
    {
        return array_fill(0, 4, ['titulo' => 'A', 'texto' => 'B']);
    }

    public function test_nao_salva_sobre_com_titulo_ou_texto_da_historia_vazio(): void
    {
        $this->comoAdmin();

        $resposta = $this->putJson('/api/admin/conteudo/sobre', [
            'titulo_historia' => '',
            'texto_historia' => '',
            'diferenciais' => $this->diferenciaisValidos(),
        ]);

        $resposta->assertStatus(422);
        $this->assertArrayHasKey('titulo_historia', $resposta->json('erros'));
        $this->assertArrayHasKey('texto_historia', $resposta->json('erros'));
    }

    public function test_nao_salva_sobre_com_diferencial_vazio(): void
    {
        $this->comoAdmin();

        $diferenciais = $this->diferenciaisValidos();
        $diferenciais[1]['titulo'] = '';

        $resposta = $this->putJson('/api/admin/conteudo/sobre', [
            'titulo_historia' => 'Nossa história',
            'texto_historia' => 'Texto',
            'diferenciais' => $diferenciais,
        ]);

        $resposta->assertStatus(422);
        $this->assertArrayHasKey('diferenciais.1.titulo', $resposta->json('erros'));
    }

    public function test_salva_sobre_sem_imagem_pois_imagem_e_opcional(): void
    {
        $this->comoAdmin();

        $this->putJson('/api/admin/conteudo/sobre', [
            'titulo_historia' => 'Nossa história',
            'texto_historia' => 'Texto',
            'diferenciais' => $this->diferenciaisValidos(),
        ])->assertOk();
    }

    public function test_nao_salva_contato_com_campo_vazio(): void
    {
        $this->comoAdmin();

        $resposta = $this->putJson('/api/admin/conteudo/contato', [
            'telefone_display' => '',
            'telefone_whatsapp' => '',
            'email' => '',
            'endereco' => '',
            'horario' => '',
        ]);

        $resposta->assertStatus(422);
        $erros = $resposta->json('erros');
        $this->assertArrayHasKey('telefone_display', $erros);
        $this->assertArrayHasKey('telefone_whatsapp', $erros);
        $this->assertArrayHasKey('email', $erros);
        $this->assertArrayHasKey('endereco', $erros);
        $this->assertArrayHasKey('horario', $erros);
    }

    public function test_nao_salva_contato_com_email_invalido(): void
    {
        $this->comoAdmin();

        $resposta = $this->putJson('/api/admin/conteudo/contato', [
            'telefone_display' => '(61) 99999-9999',
            'telefone_whatsapp' => '5561999999999',
            'email' => 'nao-e-um-email',
            'endereco' => 'Brasília, DF',
            'horario' => 'Seg. a Sáb., 9h às 18h',
        ]);

        $resposta->assertStatus(422);
        $this->assertArrayHasKey('email', $resposta->json('erros'));
    }

    public function test_salva_contato_com_todos_os_campos_preenchidos(): void
    {
        $this->comoAdmin();

        $this->putJson('/api/admin/conteudo/contato', [
            'telefone_display' => '(61) 99999-9999',
            'telefone_whatsapp' => '5561999999999',
            'email' => 'contato@moveissoares.com.br',
            'endereco' => 'Brasília, DF',
            'horario' => 'Seg. a Sáb., 9h às 18h',
        ])->assertOk();
    }
}
