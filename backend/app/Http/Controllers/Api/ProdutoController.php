<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Exceptions\ImagemInvalidaException;
use App\Services\ImagemService;
use App\Models\Categoria;
use App\Models\Produto;
use App\Models\ProdutoVisualizacao;
use App\Suporte\Helpers;
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
     * Lista todos os produtos, com a categoria carregada junto (evita N+1).
     */
    public function index(): JsonResponse
    {
        $produtos = Produto::ativos()
            ->with('categoria')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Produto $produto) => $produto->paraApi());

        return response()->json($produtos);
    }

    /**
     * Lista produtos de uma categoria especifica, pelo slug da categoria.
     */
    public function porCategoria(string $slug): JsonResponse
    {
        $categoria = Categoria::where('slug', $slug)->firstOrFail();

        $produtos = $categoria->produtos()
            ->ativos()
            ->with('categoria')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Produto $produto) => $produto->paraApi());

        return response()->json($produtos);
    }

    /**
     * Retorna um unico produto pelo slug (para pagina de detalhe futura).
     */
    public function porSlug(string $slug): JsonResponse
    {
        $produto = Produto::ativos()->with('categoria')->where('slug', $slug)->firstOrFail();

        return response()->json($produto->paraApi());
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
            return response()->json(Helpers::mensagemErro($e->getMessage()), 422);
        }

        return response()->json([
            'url' => Storage::disk('public')->url($caminhoRelativo),
        ]);
    }

    /**
     * Registra um evento de visualizacao da pagina publica do produto.
     * Chamado pelo frontend a cada acesso, sem exigir autenticacao.
     */
    public function registrarVisualizacao(int $id, Request $request): JsonResponse
    {
        Produto::findOrFail($id);

        ProdutoVisualizacao::create([
            'produto_id' => $id,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'criado_em' => now(),
        ]);

        return response()->json(Helpers::mensagemSucesso('Visualização registrada.'));
    }
}