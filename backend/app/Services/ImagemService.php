<?php

namespace App\Services;

use App\Services\Exceptions\ImagemInvalidaException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;

/**
 * Padroniza o tratamento de toda imagem enviada pelo painel (produtos,
 * categorias, conteudo institucional): valida, corta/redimensiona pra um
 * quadrado fixo centralizado, converte pra WebP e salva no disco publico.
 *
 * Nenhum Controller deve chamar $request->file(...)->store(...) direto -
 * sempre passar pelo metodo processar() abaixo.
 */
class ImagemService
{
    private const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];
    private const TAMANHO_MAXIMO_BYTES = 8 * 1024 * 1024; // 8MB
    private const QUALIDADE_WEBP = 80;
    private const DISCO = 'public';
    private const PASTA = 'produtos';

    private ImageManager $manager;

    public function __construct()
    {
        // Driver GD (padrao, nao precisa de extensao extra no servidor).
        // Se o servidor tiver Imagick disponivel, trocar por Drivers\Imagick\Driver.
        $this->manager = ImageManager::usingDriver(Driver::class);
    }

    /**
     * Processa e salva uma imagem enviada via upload.
     *
     * @param  UploadedFile  $arquivo  Arquivo recebido do request (ex: $request->file('imagem'))
     * @param  int  $tamanho  Dimensao do quadrado final em pixels (padrao 800x800)
     * @return string  Caminho relativo salvo no disco 'public' (ex: produtos/uuid.webp)
     *
     * @throws ImagemInvalidaException  Quando o tipo ou o tamanho do arquivo original nao passam na validacao
     */
    public function processar(UploadedFile $arquivo, int $tamanho = 800): string
    {
        $this->validar($arquivo);

        $imagem = $this->manager->decodePath($arquivo->getRealPath());

        // Redimensiona e corta pra um quadrado fixo, mantendo o objeto
        // centralizado (equivalente a um "object-fit: cover" no CSS).
        $imagem->cover($tamanho, $tamanho);

        $codificada = $imagem->encodeUsingFormat(Format::WEBP, quality: self::QUALIDADE_WEBP);

        $nomeArquivo = Str::uuid()->toString() . '.webp';
        $caminhoRelativo = self::PASTA . '/' . $nomeArquivo;

        Storage::disk(self::DISCO)->put($caminhoRelativo, (string) $codificada);

        return $caminhoRelativo;
    }

    /**
     * Valida o tipo e o tamanho do arquivo original ANTES de processar.
     *
     * @throws ImagemInvalidaException
     */
    private function validar(UploadedFile $arquivo): void
    {
        if (! in_array($arquivo->getMimeType(), self::TIPOS_ACEITOS, true)) {
            throw new ImagemInvalidaException(
                'Tipo de arquivo nao aceito. Envie uma imagem JPEG, PNG ou WebP.'
            );
        }

        if ($arquivo->getSize() > self::TAMANHO_MAXIMO_BYTES) {
            throw new ImagemInvalidaException(
                'Arquivo muito grande. O tamanho maximo permitido e 8MB.'
            );
        }
    }
}
