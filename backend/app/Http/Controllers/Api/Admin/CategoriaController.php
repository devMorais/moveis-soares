<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoriaController extends Controller
{
    public function index(): JsonResponse
    {
        $categorias = Categoria::withCount('produtos')
            ->orderBy('nome')
            ->get()
            ->map(fn (Categoria $c) => [
                'id' => $c->id,
                'nome' => $c->nome,
                'slug' => $c->slug,
                'imagemUrl' => $c->imagem_url,
                'totalProdutos' => $c->produtos_count,
            ]);

        return response()->json($categorias);
    }

    public function store(Request $request): JsonResponse
    {
        $dados = $this->validarDados($request);
        $dados['slug'] = Str::slug($dados['nome']);

        $categoria = Categoria::create($dados);

        return response()->json($categoria, 201);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $categoria = Categoria::findOrFail($id);
        $dados = $this->validarDados($request);
        $dados['slug'] = Str::slug($dados['nome']);

        $categoria->update($dados);

        return response()->json($categoria);
    }

    public function destroy(int $id): JsonResponse
    {
        $categoria = Categoria::withCount('produtos')->findOrFail($id);

        if ($categoria->produtos_count > 0) {
            return response()->json([
                'message' => 'Não é possível remover uma categoria com produtos cadastrados.',
            ], 422);
        }

        $categoria->delete();

        return response()->json(['message' => 'Categoria removida.']);
    }

    private function validarDados(Request $request): array
    {
        return $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'imagem_url' => ['nullable', 'string'],
        ]);
    }
}
