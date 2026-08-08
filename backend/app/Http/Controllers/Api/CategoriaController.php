<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Produto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index(): JsonResponse
    {
        $categorias = Categoria::orderBy('nome')->get()->map(fn (Categoria $categoria) => [
            'slug' => $categoria->slug,
            'nome' => $categoria->nome,
            'imagemUrl' => $categoria->imagem_url,
        ]);

        return response()->json($categorias);
    }

    public function porSlug(string $slug): JsonResponse
    {
        $categoria = Categoria::where('slug', $slug)->firstOrFail();

        return response()->json([
            'slug' => $categoria->slug,
            'nome' => $categoria->nome,
            'imagemUrl' => $categoria->imagem_url,
        ]);
    }

    /**
     * Lista, paginados, os produtos ativos de uma categoria.
     * 404 automatico (via firstOrFail) se a categoria nao existir.
     */
    public function produtos(string $slug, Request $request): JsonResponse
    {
        $categoria = Categoria::where('slug', $slug)->firstOrFail();

        $porPagina = (int) $request->query('por_pagina', 9);

        $produtos = $categoria->produtos()
            ->ativos()
            ->with('categoria')
            ->orderByDesc('created_at')
            ->paginate($porPagina);

        $produtos->through(fn (Produto $produto) => $produto->paraApi());

        return response()->json($produtos);
    }
}
