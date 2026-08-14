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

    public function test_processa_e_salva_uma_imagem_jpeg_valida_como_webp(): void
    {
        Storage::fake('public');

        $servico = new ImagemService();
        $arquivo = UploadedFile::fake()->image('foto.jpg', 100, 100);

        $caminho = $servico->processar($arquivo);

        $this->assertStringEndsWith('.webp', $caminho);
        Storage::disk('public')->assertExists($caminho);
    }
}
