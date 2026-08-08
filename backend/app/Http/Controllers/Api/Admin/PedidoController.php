<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PedidoController extends Controller
{
    private const STATUS_VALIDOS = ['AGUARDANDO', 'PAGO', 'EM_PREPARACAO', 'ENVIADO', 'ENTREGUE'];

    public function index(Request $request): JsonResponse
    {
        $query = Pedido::with('itens')->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json($query->get()->map(fn (Pedido $p) => $p->paraApi()));
    }

    public function mostrar(int $id): JsonResponse
    {
        return response()->json(Pedido::with('itens')->findOrFail($id)->paraApi());
    }

    public function atualizarStatus(int $id, Request $request): JsonResponse
    {
        $dados = $request->validate([
            'status' => ['required', 'string', 'in:' . implode(',', self::STATUS_VALIDOS)],
        ]);

        $pedido = Pedido::findOrFail($id);
        $pedido->update(['status' => $dados['status']]);

        return response()->json($pedido->paraApi());
    }
}
