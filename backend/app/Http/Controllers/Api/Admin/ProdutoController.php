<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\PedidoItem;
use App\Models\Produto;
use App\Services\ImagemService;
use App\Suporte\DescricaoSanitizer;
use App\Suporte\Helpers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProdutoController extends Controller
{
    public function __construct(
        private readonly ImagemService $imagemService
    ) {
    }

    public function index(): JsonResponse
    {
        $produtos = Produto::with('categoria')
            ->withCount('visualizacoes')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Produto $produto) => $produto->paraApi());

        return response()->json($produtos);
    }

    public function mostrar(int $id): JsonResponse
    {
        $produto = Produto::with('categoria')->withCount('visualizacoes')->findOrFail($id);

        return response()->json($produto->paraApi());
    }

    public function store(Request $request): JsonResponse
    {
        $dados = $this->validarDados($request);
        $dados['slug'] = $this->slugUnico($dados['nome']);

        $produto = Produto::create($dados);

        return response()->json($produto->fresh('categoria')->loadCount('visualizacoes')->paraApi(), 201);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $produto = Produto::findOrFail($id);
        $imagemAntiga = $produto->imagem_url;
        $dados = $this->validarDados($request);

        if ($dados['nome'] !== $produto->nome) {
            $dados['slug'] = $this->slugUnico($dados['nome'], $produto->id);
        }

        $produto->update($dados);

        // Trocou a foto: apaga as duas versoes da antiga (se ninguem mais usa).
        if ($imagemAntiga !== $produto->imagem_url) {
            $this->apagarImagemSeNinguemUsa($imagemAntiga);
        }

        return response()->json($produto->fresh('categoria')->loadCount('visualizacoes')->paraApi());
    }

    public function atualizarStatus(int $id, Request $request): JsonResponse
    {
        $dados = $request->validate([
            'ativo' => ['required', 'boolean'],
        ]);

        $produto = Produto::findOrFail($id);
        $produto->update($dados);

        return response()->json($produto->fresh('categoria')->loadCount('visualizacoes')->paraApi());
    }

    /**
     * So permite excluir de verdade um produto que nunca apareceu em
     * nenhum pedido - pedido_itens guarda um snapshot (nome/preco), entao
     * o pedido nao quebraria, mas apagar o produto original perde
     * rastreabilidade. Nesses casos o admin deve usar update() com
     * ativo=false (desativar) em vez de excluir.
     */
    public function destroy(int $id): JsonResponse
    {
        $produto = Produto::findOrFail($id);

        $temHistorico = PedidoItem::where('produto_id', $produto->id)->exists();

        if ($temHistorico) {
            return response()->json(
                Helpers::mensagemErro('Este produto já aparece em pedidos e não pode ser excluído. Desative-o para escondê-lo do site.'),
                422
            );
        }

        $produto->delete();

        // Apaga as duas versoes da foto principal (se ninguem mais usa).
        $this->apagarImagemSeNinguemUsa($produto->imagem_url);

        return response()->json(Helpers::mensagemSucesso('Produto removido.'));
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
            'descricao' => ['nullable', 'string', 'max:6000'],
            'altura_cm' => ['nullable', 'integer', 'min:0'],
            'largura_cm' => ['nullable', 'integer', 'min:0'],
            'profundidade_cm' => ['nullable', 'integer', 'min:0'],
            'selo' => ['nullable', 'string', 'max:255'],
            'estoque' => ['nullable', 'integer', 'min:0'],
            'ativo' => ['sometimes', 'boolean'],
        ]);

        $dados['imagens'] = $dados['imagens'] ?? [];
        $dados['descricao'] = DescricaoSanitizer::limpar($dados['descricao'] ?? null);

        // A versao grande nao vem do painel: o backend deduz pelo nome da
        // imagem principal. Produto antigo (sem versao grande no disco) fica null.
        $dados['imagem_original_url'] = $this->urlVersaoGrande($dados['imagem_url']);

        return $dados;
    }

    /**
     * Converte a URL publica salva em imagem_url no caminho dentro do disk
     * 'public' (produtos/abc.webp). Devolve null pra qualquer URL que nao
     * seja uma imagem gerada pelo ImagemService - assim nada fora da pasta
     * de produtos e apagado ou deduzido por engano.
     */
    private function caminhoDaImagem(?string $url): ?string
    {
        if ($url === null || $url === '') {
            return null;
        }

        $base = Storage::disk('public')->url('');

        if (str_starts_with($url, $base)) {
            $relativo = substr($url, strlen($base));
        } elseif (preg_match('#/storage/(.+)$#', $url, $m)) {
            $relativo = $m[1];
        } else {
            return null;
        }

        return preg_match('#^produtos/[^/]+\.webp$#', $relativo) ? $relativo : null;
    }

    private function urlVersaoGrande(string $urlQuadrada): ?string
    {
        $caminho = $this->caminhoDaImagem($urlQuadrada);

        if ($caminho === null) {
            return null;
        }

        $grande = $this->imagemService->caminhoGrande($caminho);

        return Storage::disk('public')->exists($grande)
            ? Storage::disk('public')->url($grande)
            : null;
    }

    /**
     * Apaga as duas versoes da imagem, mas so se nenhum outro produto
     * (imagem principal ou galeria) nem categoria ainda aponta pro mesmo
     * arquivo - o comando de stress test, por exemplo, cria varios produtos
     * compartilhando uma foto. A busca e pelo nome do arquivo porque o JSON
     * da galeria guarda as barras das URLs escapadas.
     */
    private function apagarImagemSeNinguemUsa(?string $url): void
    {
        $caminho = $this->caminhoDaImagem($url);

        if ($caminho === null) {
            return;
        }

        $nome = basename($caminho);

        $emUso = Produto::where('imagem_url', 'like', '%' . $nome)
            ->orWhere('imagens', 'like', '%' . $nome . '%')
            ->exists()
            || Categoria::where('imagem_url', 'like', '%' . $nome)->exists();

        if ($emUso) {
            return;
        }

        $this->imagemService->apagar($caminho);
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