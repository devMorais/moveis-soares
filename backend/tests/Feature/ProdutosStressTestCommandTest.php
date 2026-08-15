<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Produto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProdutosStressTestCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        // o marcador do teste de carga vive no filesystem (storage/app), nao
        // no banco - RefreshDatabase nao limpa isso sozinho entre os testes.
        $marcador = storage_path('app/stress_test_boundary.txt');
        if (file_exists($marcador)) {
            unlink($marcador);
        }

        parent::tearDown();
    }

    public function test_popula_e_reverte_sem_deixar_sujeira(): void
    {
        Categoria::factory()->count(2)->create();
        $produtoReal = Produto::factory()->create(['imagem_url' => 'assets/images/produtos/produto-real.webp']);

        $this->artisan('produtos:stress-test', ['quantidade' => 50])
            ->assertExitCode(0);

        $this->assertSame(51, Produto::count());
        $this->assertTrue(
            Produto::where('id', '>', $produtoReal->id)->get()->every(
                fn (Produto $p) => $p->imagem_url === 'assets/images/produtos/produto-real.webp'
            )
        );

        $this->artisan('produtos:stress-test', ['--reverter' => true])
            ->assertExitCode(0);

        $this->assertSame(1, Produto::count());
        $this->assertSame($produtoReal->id, Produto::first()->id);
    }

    public function test_reverter_sem_teste_ativo_falha_com_mensagem_clara(): void
    {
        $this->artisan('produtos:stress-test', ['--reverter' => true])
            ->assertExitCode(1);
    }

    public function test_nao_deixa_popular_de_novo_sem_reverter_o_anterior(): void
    {
        Categoria::factory()->create();
        Produto::factory()->create();

        $this->artisan('produtos:stress-test', ['quantidade' => 10])->assertExitCode(0);
        $this->artisan('produtos:stress-test', ['quantidade' => 10])->assertExitCode(1);

        $this->artisan('produtos:stress-test', ['--reverter' => true])->assertExitCode(0);
    }
}
