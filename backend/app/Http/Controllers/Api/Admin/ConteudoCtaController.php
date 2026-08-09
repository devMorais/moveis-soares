<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecaoCta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConteudoCtaController extends Controller
{
    public function mostrar(string $chave): JsonResponse
    {
        return response()->json(SecaoCta::where('chave', $chave)->first());
    }

    public function atualizar(string $chave, Request $request): JsonResponse
    {
        $dados = $request->validate([
            'titulo' => ['sometimes', 'nullable', 'string'],
            'texto' => ['sometimes', 'nullable', 'string'],
        ]);

        $cta = SecaoCta::firstOrNew(['chave' => $chave]);
        $cta->fill($dados);
        $cta->save();

        return response()->json($cta);
    }
}
