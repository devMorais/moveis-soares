<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\JsonResponse;

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
}
