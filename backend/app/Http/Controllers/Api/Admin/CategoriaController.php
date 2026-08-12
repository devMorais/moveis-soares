<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Suporte\Helpers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CategoriaController extends Controller
{
    public function index(): JsonResponse
    {
        $categorias = Categoria::withCount('produtos')
            ->orderBy('ordem_exibicao')
            ->orderBy('nome')
            ->get()
            ->map(fn (Categoria $c) => [
                'id' => $c->id,
                'nome' => $c->nome,
                'slug' => $c->slug,
                'imagemUrl' => $c->imagem_url,
                'ativo' => $c->ativo,
                'ordemExibicao' => $c->ordem_exibicao,
                'totalProdutos' => $c->produtos_count,
            ]);

        return response()->json($categorias);
    }

    public function store(Request $request): JsonResponse
    {
        $dados = $this->validarDados($request);

        $categoria = Categoria::create($dados);

        return response()->json($categoria, 201);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $categoria = Categoria::findOrFail($id);
        $dados = $this->validarDados($request, $categoria->id);

        $categoria->update($dados);

        return response()->json($categoria);
    }

    public function destroy(int $id): JsonResponse
    {
        $categoria = Categoria::withCount('produtos')->findOrFail($id);

        if ($categoria->produtos_count > 0) {
            return response()->json(
                Helpers::mensagemErro('Não é possível remover uma categoria com produtos cadastrados.'),
                422
            );
        }

        $categoria->delete();

        return response()->json(Helpers::mensagemSucesso('Categoria removida.'));
    }

    /**
     * Valida os dados e garante nome/slug unicos (ignorando a propria
     * categoria em updates). Rejeita com 422 amigavel em vez de deixar a
     * constraint unique do banco estourar uma excecao SQL crua na resposta -
     * ver MS-CAT-02.
     *
     * O slug e opcionalmente editavel de forma independente do nome (ver
     * campo "Slug" no admin), entao os dois precisam ser checados em
     * separado: dois nomes iguais com slugs diferentes ainda sao duplicidade
     * do ponto de vista do catalogo, mesmo que a constraint unique do banco
     * (que so cobre slug) nao acuse nada.
     */
    private function validarDados(Request $request, ?int $categoriaId = null): array
    {
        $dados = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'imagem_url' => ['nullable', 'string'],
            'ativo' => ['sometimes', 'boolean'],
            'ordem_exibicao' => ['sometimes', 'integer', 'min:0'],
        ]);

        $slug = Str::slug($dados['slug'] ?? $dados['nome']);

        $nomeOuSlugEmUso = Categoria::where(function ($query) use ($dados, $slug) {
            $query->whereRaw('LOWER(nome) = ?', [mb_strtolower($dados['nome'])])
                ->orWhere('slug', $slug);
        })
            ->when($categoriaId, fn ($query) => $query->where('id', '!=', $categoriaId))
            ->exists();

        if ($nomeOuSlugEmUso) {
            throw ValidationException::withMessages([
                'nome' => 'Já existe uma categoria com esse nome.',
            ]);
        }

        $dados['slug'] = $slug;

        return $dados;
    }
}
