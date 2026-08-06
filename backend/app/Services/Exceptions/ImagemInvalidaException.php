<?php

namespace App\Services\Exceptions;

use Exception;

/**
 * Lancada pelo ImagemService quando o arquivo enviado nao passa na
 * validacao de tipo (jpeg/png/webp) ou de tamanho maximo (8MB).
 *
 * O Controller deve capturar essa exception e responder 422 com a mensagem.
 */
class ImagemInvalidaException extends Exception
{
    public static function tipoNaoPermitido(string $tipoRecebido): self
    {
        return new self("Tipo de arquivo nao permitido: {$tipoRecebido}. Envie uma imagem JPEG, PNG ou WebP.");
    }

    public static function tamanhoExcedido(int $tamanhoBytes, int $limiteBytes): self
    {
        $tamanhoMb = round($tamanhoBytes / 1048576, 2);
        $limiteMb = round($limiteBytes / 1048576, 2);

        return new self("Arquivo muito grande ({$tamanhoMb}MB). O limite e de {$limiteMb}MB.");
    }

    public static function falhaAoSalvar(): self
    {
        return new self('Nao foi possivel salvar a imagem processada.');
    }
}
