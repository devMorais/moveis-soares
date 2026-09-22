<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Produto;
use App\Models\SecaoVisibilidade;
use Illuminate\Http\Response;

/**
 * Sitemap gerado a partir do banco, e nao de um arquivo estatico: a loja
 * cadastra produto pelo painel a qualquer momento, e um arquivo fixo
 * nasceria desatualizado no primeiro cadastro.
 *
 * Exposto publicamente em /sitemap.xml - o .htaccess da raiz reescreve
 * aquele caminho para ca (ver deploy/htaccess-raiz.txt).
 */
class SitemapController extends Controller
{
    public function index(): Response
    {
        $base = rtrim(config('app.url'), '/');
        $urls = [];

        $urls[] = ['loc' => $base.'/', 'changefreq' => 'daily', 'priority' => '1.0'];

        // Sobre/Contato podem estar desligadas no admin - pagina desligada
        // responde 404 pro visitante, entao nao entra no sitemap.
        $visiveis = SecaoVisibilidade::pluck('visivel', 'chave');
        foreach (['sobre', 'contato'] as $chave) {
            if ($visiveis[$chave] ?? false) {
                $urls[] = ['loc' => $base.'/'.$chave, 'changefreq' => 'monthly', 'priority' => '0.5'];
            }
        }

        $urls[] = ['loc' => $base.'/ajuda', 'changefreq' => 'monthly', 'priority' => '0.3'];

        foreach (Categoria::ativas()->orderBy('ordem_exibicao')->orderBy('nome')->get() as $categoria) {
            $urls[] = [
                'loc' => $base.'/categoria/'.$categoria->slug,
                'changefreq' => 'weekly',
                'priority' => '0.8',
                'lastmod' => $categoria->updated_at?->toAtomString(),
            ];
        }

        foreach (Produto::ativos()->orderByDesc('id')->get() as $produto) {
            $urls[] = [
                'loc' => $base.'/produto/'.$produto->slug,
                'changefreq' => 'weekly',
                'priority' => '0.7',
                'lastmod' => $produto->updated_at?->toAtomString(),
            ];
        }

        return response($this->montarXml($urls), 200)
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    /** @param array<int, array<string, string|null>> $urls */
    private function montarXml(array $urls): string
    {
        $linhas = ['<?xml version="1.0" encoding="UTF-8"?>'];
        $linhas[] = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        foreach ($urls as $url) {
            $linhas[] = '  <url>';
            $linhas[] = '    <loc>'.htmlspecialchars($url['loc'], ENT_XML1).'</loc>';

            if (! empty($url['lastmod'])) {
                $linhas[] = '    <lastmod>'.$url['lastmod'].'</lastmod>';
            }

            $linhas[] = '    <changefreq>'.$url['changefreq'].'</changefreq>';
            $linhas[] = '    <priority>'.$url['priority'].'</priority>';
            $linhas[] = '  </url>';
        }

        $linhas[] = '</urlset>';

        return implode("\n", $linhas)."\n";
    }
}
