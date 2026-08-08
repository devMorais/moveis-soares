<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Produto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProdutoController extends Controller
{
    public function index(): JsonResponse
    {
        $produtos = Produto::with('categoria')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Produto $produto) => $produto->paraApi());

        return response()->json($produtos);
    }

    public function mostrar(int $id): JsonResponse
    {
        $produto = Produto::with('categoria')->findOrFail($id);

        return response()->json($produto->paraApi());
    }

    public function store(Request $request): JsonResponse
    {
        $dados = $this->validarDados($request);
        $dados['slug'] = $this->slugUnico($dados['nome']);

        $produto = Produto::create($dados);

        return response()->json($produto->fresh('categoria')->paraApi(), 201);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $produto = Produto::findOrFail($id);
        $dados = $this->validarDados($request);

        if ($dados['nome'] !== $produto->nome) {
            $dados['slug'] = $this->slugUnico($dados['nome'], $produto->id);
        }

        $produto->update($dados);

        return response()->json($produto->fresh('categoria')->paraApi());
    }

    public function destroy(int $id): JsonResponse
    {
        Produto::findOrFail($id)->delete();

        return response()->json(['message' => 'Produto removido.']);
    }

    private function validarDados(Request $request): array
    {
        $dados = $request->validate([
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
            'nome' => ['required', 'string', 'max:255'],
            'preco' => ['required', 'numeric', 'min:0'],
            'preco_de' => ['nullable', 'numeric', 'min:0'],
            'imagem_url' => ['required', 'string'],
            'imagens' => ['nullable', 'array'],
            'imagens.*' => ['string'],
            'especificacao' => ['nullable', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'altura_cm' => ['nullable', 'integer', 'min:0'],
            'largura_cm' => ['nullable', 'integer', 'min:0'],
            'profundidade_cm' => ['nullable', 'integer', 'min:0'],
            'selo' => ['nullable', 'string', 'max:255'],
            'estoque' => ['nullable', 'integer', 'min:0'],
            'ativo' => ['sometimes', 'boolean'],
        ]);

        $dados['imagens'] = $dados['imagens'] ?? [];

        return $dados;
    }

    private function slugUnico(string $nome, ?int $ignorarId = null): string
    {
        $base = Str::slug($nome);
        $slug = $base;
        $contador = 1;

        while (Produto::where('slug', $slug)->when($ignorarId, fn ($q) => $q->where('id', '!=', $ignorarId))->exists()) {
            $slug = $base . '-' . (++$contador);
        }

        return $slug;
    }
}
