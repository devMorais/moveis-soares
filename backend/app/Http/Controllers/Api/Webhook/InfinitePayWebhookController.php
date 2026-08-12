<?php

namespace App\Http\Controllers\Api\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Services\Payment\InfinitePayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InfinitePayWebhookController extends Controller
{
    /**
     * Recebe a confirmacao de pagamento da InfinitePay. Rota publica, fora
     * do middleware auth:sanctum - a InfinitePay nao documenta nenhuma
     * assinatura/secret/IP fixo pra validar essa chamada, entao o payload
     * recebido aqui e tratado so como um GATILHO, nunca como fonte de
     * verdade sozinha: o pedido so e confirmado depois de uma consulta
     * ativa ao /payment_check da propria InfinitePay (mesmo metodo usado em
     * PedidoController::verificarStatus) confirmar que aquele pagamento
     * realmente esta pago. Isso impede que uma chamada forjada (sem nunca
     * ter passado pela InfinitePay de verdade) marque um pedido como pago
     * so por adivinhar/tentar o order_nsu.
     *
     * Idempotente: se o pedido ja estiver PAGO, so confirma recebimento
     * sem reprocessar (ver Pedido::confirmarPagamento()).
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

        if ($pedido->status === 'PAGO') {
            return response()->json(['success' => true]);
        }

        $infinitePay = new InfinitePayService($pedido->id);
        $resultado = $infinitePay->verificarPagamento(
            $dados['order_nsu'],
            $dados['transaction_nsu'] ?? null,
            $dados['invoice_slug'] ?? null,
        );

        if ($resultado['erro'] || ! $resultado['paid']) {
            return response()->json(['success' => false, 'message' => 'Pagamento não confirmado.'], 402);
        }

        if (isset($dados['transaction_nsu'])) {
            $pedido->infinitepay_transaction_nsu = $dados['transaction_nsu'];
        }

        if (isset($dados['invoice_slug'])) {
            $pedido->infinitepay_slug = $dados['invoice_slug'];
        }

        $pedido->save();
        $pedido->confirmarPagamento($resultado['capture_method'] === 'pix' ? 'PIX' : 'CARTAO');

        return response()->json(['success' => true]);
    }
}
