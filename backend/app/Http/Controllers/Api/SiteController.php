<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConfiguracaoSite;
use App\Models\SecaoContato;
use App\Models\SecaoCta;
use App\Models\SecaoInstitucional;
use App\Models\SecaoSobre;
use App\Models\SecaoVisibilidade;
use Illuminate\Http\JsonResponse;

class SiteController extends Controller
{
    /**
     * Endpoint publico unico que agrega todo o conteudo editavel do site
     * (textos/imagens de cada secao institucional) e o mapa de quais
     * secoes estao visiveis. Consumido pelas paginas publicas (home,
     * sobre, contato) para renderizar sem depender de dado hardcoded.
     */
    public function conteudo(): JsonResponse
    {
        return response()->json([
            'sobre' => SecaoSobre::first(),
            'contato' => SecaoContato::first(),
            'institucional' => SecaoInstitucional::first(),
            'cta' => SecaoCta::all()->keyBy('chave'),
            'secoesVisiveis' => SecaoVisibilidade::mapaDeVisibilidade(),
            'identidade' => [
                'logoUrl' => ConfiguracaoSite::instancia()->logo_url,
            ],
        ]);
    }
}
