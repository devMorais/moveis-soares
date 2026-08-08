<?php

namespace App\Suporte;

/**
 * Metodos auxiliares reutilizaveis entre controllers - formato de resposta
 * de mensagem, formatacao de valores, etc.
 */
class Helpers
{
    /**
     * Monta o payload padrao de mensagem de API: {mensagem, tipo}.
     * Mesmo shape usado pelo Handler global de excecoes (bootstrap/app.php),
     * pra toda resposta da API - sucesso ou erro - seguir um unico formato
     * que o ToastService do frontend sempre sabe exibir.
     */
    public static function mensagem(string $texto, string $tipo = 'sucesso'): array
    {
        return ['mensagem' => $texto, 'tipo' => $tipo];
    }

    public static function mensagemSucesso(string $texto): array
    {
        return self::mensagem($texto, 'sucesso');
    }

    public static function mensagemErro(string $texto): array
    {
        return self::mensagem($texto, 'erro');
    }

    /**
     * Formata um valor monetario no padrao brasileiro (1234.5 -> "1.234,50").
     */
    public static function formatarValor(?float $valor = null): string
    {
        return number_format($valor ?? 0, 2, ',', '.');
    }

    /**
     * Resume um texto para um limite de caracteres, sem cortar palavra ao meio.
     */
    public static function resumirTexto(string $texto, int $limite, string $continuar = '...'): string
    {
        $textoLimpo = trim(html_entity_decode(strip_tags($texto)));

        if (mb_strlen($textoLimpo) <= $limite) {
            return $textoLimpo;
        }

        $textoCortado = mb_substr($textoLimpo, 0, $limite);
        $ultimoEspaco = mb_strrpos($textoCortado, ' ');

        if ($ultimoEspaco !== false) {
            $textoCortado = mb_substr($textoCortado, 0, $ultimoEspaco);
        }

        return $textoCortado . $continuar;
    }
}
