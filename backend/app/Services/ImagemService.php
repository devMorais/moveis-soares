<?php

namespace App\Services;

use App\Services\Exceptions\ImagemInvalidaException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Image;
use Illuminate\Support\Str;

class ImagemService
{
    /**
     * Tipos MIME aceitos para upload de imagem.
     */
    private const TIPOS_PERMITIDOS = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    /**
     * Tamanho maximo do arquivo original, em bytes (8MB).
     */
    private const TAMANHO_MAXIMO_BYTES = 8 * 1024 * 1024;

    /**
     * Pasta dentro do disk 'public' onde as imagens processadas sao salvas.
     */
    private const PASTA_DESTINO = 'produtos';

    /**
     * Processa um upload de imagem: valida, redimensiona/corta para um
     * quadrado fixo, converte para WebP e salva no disco publico.
     *
     * @throws ImagemInvalidaException
     */
    public function processar(UploadedFile $arquivo, int $tamanho = 800): string
    {
        $this->validar($arquivo);

        $nomeArquivo = Str::uuid()->toString() . '.webp';

        $caminho = Image::fromUpload($arquivo)
            ->cover($tamanho, $tamanho)
            ->toWebp()
            ->quality(80)
            ->storePubliclyAs(path: self::PASTA_DESTINO, name: $nomeArquivo, disk: 'public');

        if ($caminho === false) {
            throw ImagemInvalidaException::falhaAoSalvar();
        }

        return $caminho;
    }

    /**
     * @throws ImagemInvalidaException
     */
    private function validar(UploadedFile $arquivo): void
    {
        $mime = $arquivo->getMimeType();

        if (! in_array($mime, self::TIPOS_PERMITIDOS, true)) {
            throw ImagemInvalidaException::tipoNaoPermitido($mime ?? 'desconhecido');
        }

        $tamanhoBytes = $arquivo->getSize();

        if ($tamanhoBytes === false || $tamanhoBytes > self::TAMANHO_MAXIMO_BYTES) {
            throw ImagemInvalidaException::tamanhoExcedido(
                $tamanhoBytes ?: 0,
                self::TAMANHO_MAXIMO_BYTES
            );
        }
    }
}
