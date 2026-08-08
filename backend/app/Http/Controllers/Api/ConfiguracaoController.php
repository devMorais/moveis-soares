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
}
