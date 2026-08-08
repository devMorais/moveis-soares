<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CidadeEntrega;
use Illuminate\Http\JsonResponse;

class CidadeEntregaController extends Controller
{
    /**
     * Lista publica das cidades ativas - alimenta o select de cidade no
     * checkout (MS-PED-03). Nunca uma lista fixa no frontend.
     */
    public function listar(): JsonResponse
    {
        $cidades = CidadeEntrega::where('ativo', true)
            ->orderBy('nome_cidade')
            ->get()
            ->map(fn (CidadeEntrega $cidade) => $cidade->paraApi());

        return response()->json($cidades);
    }
}
