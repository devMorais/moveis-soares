<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Exceptions\ImagemInvalidaException;
use App\Services\ImagemService;
use App\Models\Categoria;
use App\Models\ConfiguracaoSite;
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
     * Lista os produtos ativos, paginados - o tamanho da pagina e definido
     * pelo admin em Configuracoes > Catalogo (ConfiguracaoSite::produtos_por_pagina),
     * nao pelo visitante, pra manter controle total no painel. Aceita
     * ?categoria=slug opcional pra filtrar sem trocar de rota (usado pelos
     * filtros da home).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Produto::ativos()->with('categoria');

        if ($slug = $request->query('categoria')) {
            // Filtro direto por categoria_id (indexado) em vez de whereHas
            // (subconsulta correlacionada) - mesma coisa pro visitante,
            // muito mais barato pro banco com o catalogo grande.
            $categoriaId = Categoria::where('slug', $slug)->value('id');
            $query->where('categoria_id', $categoriaId ?? 0);
        }

        $porPagina = ConfiguracaoSite::instancia()->produtos_por_pagina;

        // Ordena por id (chave primaria, ja indexada) em vez de created_at:
        // mesmo resultado pratico (mais novo primeiro) mas aproveitando os
        // indices compostos abaixo sem precisar de mais uma coluna neles.
        $produtos = $query->orderByDesc('id')->paginate($porPagina);
        $produtos->through(fn (Produto $produto) => $produto->paraApi());

        return response()->json($produtos);
    }

    /**
     * Produtos em destaque (com selo) pro carrossel da home - separado da
     * listagem paginada de proposito: um produto em destaque pode estar em
     * qualquer pagina do catalogo completo, entao o carrossel precisa da
     * sua propria busca pequena e independente da paginacao.
     */
    public function destaques(): JsonResponse
    {
        $produtos = Produto::ativos()
            ->whereNotNull('selo')
            ->with('categoria')
            ->orderByDesc('id')
            ->limit(10)
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
            ->orderByDesc('id')
            // Rota publica sem paginacao - trava num teto de seguranca pra
            // nao devolver o catalogo inteiro de uma vez com o site grande.
            ->limit(200)
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