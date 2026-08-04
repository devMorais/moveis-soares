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
    //
}