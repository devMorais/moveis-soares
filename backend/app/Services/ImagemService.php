<?php

namespace App\Services;

use App\Services\Exceptions\ImagemInvalidaException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Image;
use Illuminate\Support\Facades\Storage;
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
     * Lado maior da versao grande, em pixels. Imagem menor que isso nao e
     * ampliada (scale() nunca amplia).
     */
    private const LADO_MAXIMO_GRANDE = 1600;

    private const QUALIDADE_QUADRADA = 80;

    private const QUALIDADE_GRANDE = 85;

    /**
     * Sufixo do nome da versao grande: {uuid}.webp (quadrada) e
     * {uuid}-grande.webp (grande) ficam lado a lado na mesma pasta.
     */
    private const SUFIXO_GRANDE = '-grande';

    /**
     * Processa um upload de imagem: valida e gera DUAS versoes WebP no disco
     * publico - a quadrada (cover, vitrine) e a grande (proporcao original,
     * zoom da pagina do produto).
     *
     * @return array{quadrada: string, grande: string} caminhos relativos ao disk 'public'
     *
     * @throws ImagemInvalidaException
     */
    public function processar(UploadedFile $arquivo, int $tamanho = 800): array
    {
        $this->validar($arquivo);

        $uuid = Str::uuid()->toString();
        $nomeQuadrada = $uuid . '.webp';
        $nomeGrande = $uuid . self::SUFIXO_GRANDE . '.webp';

        $caminhoQuadrada = Image::fromUpload($arquivo)
            ->cover($tamanho, $tamanho)
            ->toWebp()
            ->quality(self::QUALIDADE_QUADRADA)
            ->storePubliclyAs(path: self::PASTA_DESTINO, name: $nomeQuadrada, disk: 'public');

        if ($caminhoQuadrada === false) {
            throw ImagemInvalidaException::falhaAoSalvar();
        }

        $caminhoGrande = Image::fromUpload($arquivo)
            ->scale(self::LADO_MAXIMO_GRANDE, self::LADO_MAXIMO_GRANDE)
            ->toWebp()
            ->quality(self::QUALIDADE_GRANDE)
            ->storePubliclyAs(path: self::PASTA_DESTINO, name: $nomeGrande, disk: 'public');

        if ($caminhoGrande === false) {
            // Nao deixa a quadrada orfa se a grande falhou.
            Storage::disk('public')->delete($caminhoQuadrada);

            throw ImagemInvalidaException::falhaAoSalvar();
        }

        return [
            'quadrada' => $caminhoQuadrada,
            'grande' => $caminhoGrande,
        ];
    }

    /**
     * Deduz o caminho da versao grande a partir do caminho da quadrada
     * (produtos/abc.webp -> produtos/abc-grande.webp).
     */
    public function caminhoGrande(string $caminhoQuadrada): string
    {
        return Str::replaceLast('.webp', self::SUFIXO_GRANDE . '.webp', $caminhoQuadrada);
    }

    /**
     * Apaga do disco as DUAS versoes de uma imagem, a partir do caminho da
     * quadrada. Produto antigo, que nao tem a grande, nao da erro: o delete
     * ignora arquivo inexistente.
     */
    public function apagar(?string $caminhoQuadrada): void
    {
        if ($caminhoQuadrada === null || $caminhoQuadrada === '') {
            return;
        }

        Storage::disk('public')->delete([
            $caminhoQuadrada,
            $this->caminhoGrande($caminhoQuadrada),
        ]);
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