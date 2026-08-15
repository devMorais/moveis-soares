<?php

namespace App\Suporte;

use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * Filtra o HTML gerado pelo editor de texto rico do admin (Quill) antes de
 * salvar, mantendo so um whitelist de tags/atributos de formatacao. Evita
 * que um script/atributo malicioso salvo na descricao de um produto rode
 * na pagina publica de qualquer visitante.
 */
class DescricaoSanitizer
{
    private const TAGS_PERMITIDAS = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
        'ol', 'ul', 'li', 'a', 'h1', 'h2', 'h3', 'blockquote',
    ];

    private const ATRIBUTOS_PERMITIDOS = [
        'a' => ['href', 'target', 'rel'],
    ];

    public static function limpar(?string $html): ?string
    {
        if ($html === null || trim($html) === '') {
            return null;
        }

        $documento = new DOMDocument();
        libxml_use_internal_errors(true);
        $documento->loadHTML(
            '<?xml encoding="utf-8" ?><div>' . $html . '</div>',
            LIBXML_NOERROR | LIBXML_NOWARNING
        );
        libxml_clear_errors();

        $raiz = $documento->getElementsByTagName('div')->item(0);

        if (! $raiz) {
            return null;
        }

        self::limparNo($documento, $raiz);

        $resultado = '';
        foreach (iterator_to_array($raiz->childNodes) as $filho) {
            $resultado .= $documento->saveHTML($filho);
        }

        $resultado = trim($resultado);

        return trim(strip_tags($resultado)) === '' ? null : $resultado;
    }

    private static function limparNo(DOMDocument $documento, DOMNode $no): void
    {
        foreach (iterator_to_array($no->childNodes) as $filho) {
            if ($filho->nodeType === XML_TEXT_NODE) {
                continue;
            }

            if (! $filho instanceof DOMElement) {
                $no->removeChild($filho);
                continue;
            }

            $tag = strtolower($filho->tagName);

            if (! in_array($tag, self::TAGS_PERMITIDAS, true)) {
                while ($filho->firstChild) {
                    $no->insertBefore($filho->firstChild, $filho);
                }
                $no->removeChild($filho);
                continue;
            }

            self::limparAtributos($filho, $tag);
            self::limparNo($documento, $filho);
        }
    }

    private static function limparAtributos(DOMElement $elemento, string $tag): void
    {
        $permitidos = self::ATRIBUTOS_PERMITIDOS[$tag] ?? [];

        foreach (iterator_to_array($elemento->attributes ?? []) as $atributo) {
            if (! in_array($atributo->nodeName, $permitidos, true)) {
                $elemento->removeAttribute($atributo->nodeName);
            }
        }

        if ($tag === 'a') {
            $href = $elemento->getAttribute('href');
            if ($href !== '' && ! preg_match('/^(https?:|mailto:|tel:)/i', $href)) {
                $elemento->removeAttribute('href');
            }
            $elemento->setAttribute('target', '_blank');
            $elemento->setAttribute('rel', 'noopener noreferrer');
        }
    }
}
