<?php

namespace App\Http\Controllers\Api\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InfinitePayWebhookController extends Controller
{
    /**
     * Recebe a confirmacao de pagamento da InfinitePay. Rota publica,
     * fora do middleware auth:sanctum. Idempotente: se o pedido ja
     * estiver PAGO, so confirma recebimento sem reprocessar
     * (ver Pedido::confirmarPagamento()).
     */
    public function receber(Request $request): JsonResponse
    {
        $dados = $request->all();

        if (! isset($dados['order_nsu'])) {
            return response()->json(['success' => false, 'message' => 'order_nsu não fornecido'], 400);
        }

        $pedido = Pedido::where('infinitepay_order_nsu', $dados['order_nsu'])->first();

        if (! $pedido) {
            return response()->json(['success' => false, 'message' => 'Pedido não encontrado'], 400);
        }

        if (isset($dados['transaction_nsu'])) {
            $pedido->infinitepay_transaction_nsu = $dados['transaction_nsu'];
            $pedido->save();
        }

        if (isset($dados['invoice_slug'])) {
            $pedido->infinitepay_slug = $dados['invoice_slug'];
            $pedido->save();
        }

        $metodo = ($dados['capture_method'] ?? '') === 'pix' ? 'PIX' : 'CARTAO';
        $pedido->confirmarPagamento($metodo);

        return response()->json(['success' => true]);
    }
}
