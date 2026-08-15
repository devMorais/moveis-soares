<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\ConfiguracaoSite;
use App\Models\Produto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index(): JsonResponse
    {
        $categorias = Categoria::ativas()
            ->orderBy('ordem_exibicao')
            ->orderBy('nome')
            ->get()
            ->map(fn (Categoria $categoria) => [
                'slug' => $categoria->slug,
                'nome' => $categoria->nome,
                'imagemUrl' => $categoria->imagem_url,
            ]);

        return response()->json($categorias);
    }

    public function porSlug(string $slug): JsonResponse
    {
        $categoria = Categoria::ativas()->where('slug', $slug)->firstOrFail();

        return response()->json([
            'slug' => $categoria->slug,
            'nome' => $categoria->nome,
            'imagemUrl' => $categoria->imagem_url,
        ]);
    }

    /**
     * Lista, paginados, os produtos ativos de uma categoria.
     * 404 automatico (via firstOrFail) se a categoria nao existir ou estiver inativa.
     * Tamanho de pagina e ordenacao definidos pelo admin (Configuracoes >
     * Catalogo), mesmo criterio usado em ProdutoController::index() - um so
     * lugar pra controlar como o catalogo aparece em todo o site.
     */
    public function produtos(string $slug, Request $request): JsonResponse
    {
        $categoria = Categoria::ativas()->where('slug', $slug)->firstOrFail();

        $config = ConfiguracaoSite::instancia();

        $produtos = $categoria->produtos()
            ->ativos()
            ->with('categoria')
            ->ordenarConforme($config->produtos_ordenacao)
            ->paginate($config->produtos_por_pagina);

        $produtos->through(fn (Produto $produto) => $produto->paraApi());

        return response()->json($produtos);
    }
}
