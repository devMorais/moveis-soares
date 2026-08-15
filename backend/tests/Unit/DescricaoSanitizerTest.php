<?php

namespace Tests\Unit;

use App\Suporte\DescricaoSanitizer;
use PHPUnit\Framework\TestCase;

class DescricaoSanitizerTest extends TestCase
{
    public function test_mantem_tags_de_formatacao_permitidas(): void
    {
        $html = '<p>Sofá <strong>confortável</strong> com <em>tecido</em> resistente.</p><ul><li>Item 1</li></ul>';

        $this->assertSame($html, DescricaoSanitizer::limpar($html));
    }

    public function test_remove_script_mas_preserva_o_texto(): void
    {
        $resultado = DescricaoSanitizer::limpar('<p>Preço bom</p><script>alert(1)</script>');

        $this->assertStringNotContainsString('<script', $resultado);
        $this->assertStringContainsString('Preço bom', $resultado);
    }

    public function test_remove_atributos_de_evento_de_uma_tag_permitida(): void
    {
        $resultado = DescricaoSanitizer::limpar('<p onclick="alert(1)">Texto</p>');

        $this->assertStringNotContainsString('onclick', $resultado);
        $this->assertStringContainsString('Texto', $resultado);
    }

    public function test_bloqueia_href_com_javascript(): void
    {
        $resultado = DescricaoSanitizer::limpar('<a href="javascript:alert(1)">clique</a>');

        $this->assertStringNotContainsString('javascript:', $resultado);
    }

    public function test_permite_link_http_e_forca_atributos_seguros(): void
    {
        $resultado = DescricaoSanitizer::limpar('<a href="https://exemplo.com">site</a>');

        $this->assertStringContainsString('href="https://exemplo.com"', $resultado);
        $this->assertStringContainsString('rel="noopener noreferrer"', $resultado);
        $this->assertStringContainsString('target="_blank"', $resultado);
    }

    public function test_string_vazia_ou_so_com_espacos_vira_null(): void
    {
        $this->assertNull(DescricaoSanitizer::limpar(''));
        $this->assertNull(DescricaoSanitizer::limpar('   '));
        $this->assertNull(DescricaoSanitizer::limpar(null));
        $this->assertNull(DescricaoSanitizer::limpar('<p></p>'));
    }
}
