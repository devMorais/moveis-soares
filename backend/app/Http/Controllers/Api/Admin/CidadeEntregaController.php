<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CidadeEntrega;
use App\Suporte\Helpers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CidadeEntregaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            CidadeEntrega::orderBy('nome_cidade')->get()->map(fn (CidadeEntrega $c) => $c->paraApi())
        );
    }

    public function store(Request $request): JsonResponse
    {
        $dados = $this->validarDados($request);
        $cidade = CidadeEntrega::create($dados)->refresh();

        return response()->json($cidade->paraApi(), 201);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $cidade = CidadeEntrega::findOrFail($id);
        $dados = $this->validarDados($request);
        $cidade->update($dados);

        return response()->json($cidade->paraApi());
    }

    public function destroy(int $id): JsonResponse
    {
        CidadeEntrega::findOrFail($id)->delete();

        return response()->json(Helpers::mensagemSucesso('Cidade removida.'));
    }

    private function validarDados(Request $request): array
    {
        return $request->validate([
            'nome_cidade' => ['required', 'string', 'max:255'],
            'uf' => ['required', 'string', 'size:2'],
            'valor_frete' => ['required', 'numeric', 'min:0'],
            'prazo_dias_estimado' => ['nullable', 'integer', 'min:0'],
            'eh_retirada_local' => ['sometimes', 'boolean'],
            'ativo' => ['sometimes', 'boolean'],
        ]);
    }
}
