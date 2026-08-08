<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConfiguracaoSite;
use Illuminate\Http\JsonResponse;

class ConfiguracaoController extends Controller
{
    /**
     * Modulos habilitados para esta instalacao do painel (ex: instagram,
     * ecommerce). Usado pelo componente app-modulo-bloqueado no frontend
     * para decidir o que mostrar liberado ou bloqueado.
     */
    public function modulos(): JsonResponse
    {
        return response()->json(ConfiguracaoSite::modulos());
    }

    /**
     * SEO publico da instalacao - consumido pelo Seo service do frontend
     * pra montar title/meta/OG padrao e pelo <head> pra GA/GSC/robots.
     */
    public function seo(): JsonResponse
    {
        $config = ConfiguracaoSite::instancia();

        return response()->json([
            'tituloSite' => $config->seo_titulo_site,
            'tituloPadrao' => $config->seo_titulo_padrao,
            'descricaoPadrao' => $config->seo_descricao_padrao,
            'palavrasChave' => $config->seo_palavras_chave,
            'ogImageUrl' => $config->seo_og_image_url,
            'faviconUrl' => $config->seo_favicon_url,
            'googleAnalyticsId' => $config->seo_google_analytics_id,
            'googleSearchConsoleTag' => $config->seo_google_search_console_tag,
            'indexarSite' => $config->seo_indexar_site,
        ]);
    }
}
