<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Produto;
use App\Models\ProdutoVisualizacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    private const STATUS_FATURADOS = ['PAGO', 'EM_PREPARACAO', 'ENVIADO', 'ENTREGUE'];

    public function resumo(): JsonResponse
    {
        $pedidosFaturados = Pedido::whereIn('status', self::STATUS_FATURADOS);

        $totalPedidos = Pedido::count();
        $pedidosNoMes = Pedido::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count();
        $faturamentoTotal = (float) (clone $pedidosFaturados)->sum('valor_total');
        $pedidosAguardando = Pedido::where('status', 'AGUARDANDO')->count();
        $ticketMedio = (clone $pedidosFaturados)->count() > 0
            ? $faturamentoTotal / (clone $pedidosFaturados)->count()
            : 0;

        $pedidosPorStatus = Pedido::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $vendasPorDia = Pedido::select(DB::raw('DATE(created_at) as data'), DB::raw('sum(valor_total) as total'))
            ->where('created_at', '>=', now()->subDays(30)->startOfDay())
            ->groupBy('data')
            ->orderBy('data')
            ->get()
            ->map(fn ($linha) => ['data' => $linha->data, 'total' => (float) $linha->total]);

        $produtosMaisVendidos = PedidoItem::select('produto_id', 'nome_produto', DB::raw('sum(quantidade) as total'))
            ->groupBy('produto_id', 'nome_produto')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($linha) => ['nome' => $linha->nome_produto, 'total' => (int) $linha->total]);

        $produtosMaisVisitados = ProdutoVisualizacao::select('produto_id', DB::raw('count(*) as total'))
            ->groupBy('produto_id')
            ->orderByDesc('total')
            ->limit(5)
            ->with('produto:id,nome')
            ->get()
            ->filter(fn ($linha) => $linha->produto !== null)
            ->map(fn ($linha) => ['nome' => $linha->produto->nome, 'total' => (int) $linha->total])
            ->values();

        $categoriasMaisVisitadas = ProdutoVisualizacao::join('produtos', 'produtos.id', '=', 'produto_visualizacoes.produto_id')
            ->join('categorias', 'categorias.id', '=', 'produtos.categoria_id')
            ->select('categorias.nome', DB::raw('count(*) as total'))
            ->groupBy('categorias.id', 'categorias.nome')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($linha) => ['nome' => $linha->nome, 'total' => (int) $linha->total]);

        return response()->json([
            'kpis' => [
                'totalPedidos' => $totalPedidos,
                'pedidosNoMes' => $pedidosNoMes,
                'faturamentoTotal' => $faturamentoTotal,
                'pedidosAguardando' => $pedidosAguardando,
                'ticketMedio' => round($ticketMedio, 2),
                'totalProdutos' => Produto::count(),
            ],
            'pedidosPorStatus' => $pedidosPorStatus,
            'vendasPorDia' => $vendasPorDia,
            'produtosMaisVendidos' => $produtosMaisVendidos,
            'produtosMaisVisitados' => $produtosMaisVisitados,
            'categoriasMaisVisitadas' => $categoriasMaisVisitadas,
        ]);
    }
}
