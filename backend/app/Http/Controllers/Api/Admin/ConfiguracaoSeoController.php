<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConfiguracaoSite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConfiguracaoSeoController extends Controller
{
    public function mostrar(): JsonResponse
    {
        return response()->json($this->paraApi(ConfiguracaoSite::instancia()));
    }

    public function atualizar(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'logo_url' => ['nullable', 'string'],
            'seo_titulo_site' => ['nullable', 'string', 'max:255'],
            'seo_titulo_padrao' => ['nullable', 'string', 'max:255'],
            'seo_descricao_padrao' => ['nullable', 'string', 'max:500'],
            'seo_palavras_chave' => ['nullable', 'string', 'max:255'],
            'seo_og_image_url' => ['nullable', 'string'],
            'seo_favicon_url' => ['nullable', 'string'],
            'seo_google_analytics_id' => ['nullable', 'string', 'max:50'],
            'seo_google_search_console_tag' => ['nullable', 'string', 'max:255'],
            'seo_indexar_site' => ['sometimes', 'boolean'],
        ]);

        $config = ConfiguracaoSite::instancia();
        $config->update($dados);

        return response()->json($this->paraApi($config->fresh()));
    }

    private function paraApi(ConfiguracaoSite $config): array
    {
        return [
            'logoUrl' => $config->logo_url,
            'tituloSite' => $config->seo_titulo_site,
            'tituloPadrao' => $config->seo_titulo_padrao,
            'descricaoPadrao' => $config->seo_descricao_padrao,
            'palavrasChave' => $config->seo_palavras_chave,
            'ogImageUrl' => $config->seo_og_image_url,
            'faviconUrl' => $config->seo_favicon_url,
            'googleAnalyticsId' => $config->seo_google_analytics_id,
            'googleSearchConsoleTag' => $config->seo_google_search_console_tag,
            'indexarSite' => $config->seo_indexar_site,
        ];
    }

    public function mostrarNotificacoes(): JsonResponse
    {
        return response()->json($this->notificacoesParaApi(ConfiguracaoSite::instancia()));
    }

    public function atualizarNotificacoes(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'notificacao_email' => ['nullable', 'email', 'max:255'],
            'notificacao_whatsapp' => ['nullable', 'string', 'max:20'],
        ]);

        $config = ConfiguracaoSite::instancia();
        $config->update($dados);

        return response()->json($this->notificacoesParaApi($config->fresh()));
    }

    private function notificacoesParaApi(ConfiguracaoSite $config): array
    {
        return [
            'notificacaoEmail' => $config->notificacao_email,
            'notificacaoWhatsapp' => $config->notificacao_whatsapp,
        ];
    }
}
