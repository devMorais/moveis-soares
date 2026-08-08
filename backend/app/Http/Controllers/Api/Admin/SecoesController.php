<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecaoVisibilidade;
use App\Suporte\Helpers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SecoesController extends Controller
{
    public function listar(): JsonResponse
    {
        SecaoVisibilidade::mapaDeVisibilidade();

        return response()->json(SecaoVisibilidade::orderBy('chave')->get());
    }

    /**
     * Atualiza a visibilidade de uma secao. Uma secao com bloqueada=true
     * (hoje so 'hero') nunca pode ser desligada - evita o cliente deixar
     * o site inteiro em branco por engano.
     */
    public function atualizar(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'chave' => ['required', 'string'],
            'visivel' => ['required', 'boolean'],
        ]);

        $secao = SecaoVisibilidade::where('chave', $dados['chave'])->firstOrFail();

        if ($secao->bloqueada && ! $dados['visivel']) {
            return response()->json(
                Helpers::mensagemErro('Esta seção não pode ser desativada.'),
                422
            );
        }

        $secao->update(['visivel' => $dados['visivel']]);

        return response()->json($secao);
    }
}
