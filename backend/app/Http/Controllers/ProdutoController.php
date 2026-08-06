<?php

namespace App\Http\Controllers;

use App\Services\Exceptions\ImagemInvalidaException;
use App\Services\ImagemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProdutoController extends Controller
{
    public function __construct(
        private readonly ImagemService $imagemService
    ) {
    }

    /**
     * Recebe o upload de uma imagem de produto, processa via ImagemService
     * (WebP, 800x800, 80% de qualidade) e retorna a URL publica salva.
     *
     * Nenhum Controller deve chamar $request->file(...)->store(...)
     * diretamente - sempre passar pelo ImagemService::processar().
     */
    public function uploadImagem(Request $request): JsonResponse
    {
        $request->validate([
            'imagem' => ['required', 'file'],
        ]);

        try {
            $caminhoRelativo = $this->imagemService->processar($request->file('imagem'));
        } catch (ImagemInvalidaException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'url' => Storage::disk('public')->url($caminhoRelativo),
        ]);
    }
}
