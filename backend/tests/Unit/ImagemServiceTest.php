<?php

namespace Tests\Unit;

use App\Services\Exceptions\ImagemInvalidaException;
use App\Services\ImagemService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImagemServiceTest extends TestCase
{
    public function test_rejeita_tipo_de_arquivo_nao_permitido(): void
    {
        $servico = new ImagemService();
        $arquivo = UploadedFile::fake()->create('documento.pdf', 100, 'application/pdf');

        $this->expectException(ImagemInvalidaException::class);
        $this->expectExceptionMessage('Tipo de arquivo nao permitido');

        $servico->processar($arquivo);
    }

    public function test_rejeita_arquivo_maior_que_8mb(): void
    {
        $servico = new ImagemService();
        // create() recebe o tamanho em KB - 9000KB ~ 8.8MB, acima do limite de 8MB.
        $arquivo = UploadedFile::fake()->create('foto.jpg', 9000, 'image/jpeg');

        $this->expectException(ImagemInvalidaException::class);
        $this->expectExceptionMessage('Arquivo muito grande');

        $servico->processar($arquivo);
    }

    public function test_processa_e_salva_duas_versoes_webp(): void
    {
        Storage::fake('public');

        $servico = new ImagemService();
        $arquivo = UploadedFile::fake()->image('foto.jpg', 100, 100);

        $caminhos = $servico->processar($arquivo);

        $this->assertStringEndsWith('.webp', $caminhos['quadrada']);
        $this->assertStringEndsWith('-grande.webp', $caminhos['grande']);
        $this->assertSame($caminhos['grande'], $servico->caminhoGrande($caminhos['quadrada']));
        Storage::disk('public')->assertExists($caminhos['quadrada']);
        Storage::disk('public')->assertExists($caminhos['grande']);
    }

    public function test_versao_quadrada_continua_800x800(): void
    {
        Storage::fake('public');

        $servico = new ImagemService();
        $caminhos = $servico->processar(UploadedFile::fake()->image('foto.jpg', 2000, 1000));

        [$largura, $altura] = $this->dimensoes($caminhos['quadrada']);

        $this->assertSame(800, $largura);
        $this->assertSame(800, $altura);
    }

    public function test_versao_grande_preserva_proporcao_de_foto_larga(): void
    {
        Storage::fake('public');

        $servico = new ImagemService();
        $caminhos = $servico->processar(UploadedFile::fake()->image('sofa.jpg', 2000, 1000));

        [$largura, $altura] = $this->dimensoes($caminhos['grande']);

        $this->assertSame(1600, $largura);
        $this->assertSame(800, $altura);
    }

    public function test_versao_grande_preserva_proporcao_de_foto_alta(): void
    {
        Storage::fake('public');

        $servico = new ImagemService();
        $caminhos = $servico->processar(UploadedFile::fake()->image('guarda-roupa.jpg', 1000, 2000));

        [$largura, $altura] = $this->dimensoes($caminhos['grande']);

        $this->assertSame(800, $largura);
        $this->assertSame(1600, $altura);
    }

    public function test_versao_grande_nao_amplia_foto_pequena(): void
    {
        Storage::fake('public');

        $servico = new ImagemService();
        $caminhos = $servico->processar(UploadedFile::fake()->image('pequena.jpg', 300, 200));

        [$largura, $altura] = $this->dimensoes($caminhos['grande']);

        $this->assertSame(300, $largura);
        $this->assertSame(200, $altura);
    }

    public function test_apagar_remove_as_duas_versoes(): void
    {
        Storage::fake('public');

        $servico = new ImagemService();
        $caminhos = $servico->processar(UploadedFile::fake()->image('foto.jpg', 100, 100));

        $servico->apagar($caminhos['quadrada']);

        Storage::disk('public')->assertMissing($caminhos['quadrada']);
        Storage::disk('public')->assertMissing($caminhos['grande']);
    }

    public function test_apagar_nao_da_erro_em_produto_antigo_sem_versao_grande(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('produtos/antigo.webp', 'conteudo');

        $servico = new ImagemService();
        $servico->apagar('produtos/antigo.webp');

        Storage::disk('public')->assertMissing('produtos/antigo.webp');
    }

    public function test_apagar_ignora_caminho_vazio(): void
    {
        Storage::fake('public');

        $servico = new ImagemService();
        $servico->apagar(null);
        $servico->apagar('');

        $this->assertTrue(true);
    }

    /**
     * @return array{0: int, 1: int} largura e altura do arquivo salvo
     */
    private function dimensoes(string $caminho): array
    {
        $info = getimagesizefromstring(Storage::disk('public')->get($caminho));

        return [$info[0], $info[1]];
    }
}