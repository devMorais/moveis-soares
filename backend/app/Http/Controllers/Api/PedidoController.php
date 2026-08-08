<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NovoPedidoRecebido;
use App\Models\CidadeEntrega;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Produto;
use App\Services\Payment\InfinitePayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PedidoController extends Controller
{
    public function criar(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'nome_cliente' => ['required', 'string', 'max:255'],
            'telefone_cliente' => ['required', 'string', 'max:30'],
            'endereco' => ['required', 'string', 'max:500'],
            'cidade_entrega_id' => ['nullable', 'integer', 'exists:cidades_entrega,id'],
            'cidade_texto_livre' => ['nullable', 'string', 'max:255'],
            'frete_a_combinar' => ['required', 'boolean'],
            'itens' => ['required', 'array', 'min:1'],
            'itens.*.produto_id' => ['required', 'integer', 'exists:produtos,id'],
            'itens.*.quantidade' => ['required', 'integer', 'min:1'],
        ]);

        try {
            $pedido = DB::transaction(function () use ($dados) {
                $cidade = $dados['cidade_entrega_id'] ? CidadeEntrega::find($dados['cidade_entrega_id']) : null;
                $valorFrete = $cidade?->valor_frete;

                $produtos = Produto::whereIn('id', collect($dados['itens'])->pluck('produto_id'))
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                $valorTotal = 0;
                $itensParaCriar = [];

                foreach ($dados['itens'] as $item) {
                    $produto = $produtos->get($item['produto_id']);

                    if (! $produto) {
                        throw new \RuntimeException("Produto {$item['produto_id']} não encontrado.");
                    }

                    if ($produto->estoque !== null && $produto->estoque < $item['quantidade']) {
                        throw new \RuntimeException("Estoque insuficiente para \"{$produto->nome}\".");
                    }

                    $valorTotal += $produto->preco * $item['quantidade'];

                    $itensParaCriar[] = [
                        'produto_id' => $produto->id,
                        'nome_produto' => $produto->nome,
                        'preco_unitario' => $produto->preco,
                        'quantidade' => $item['quantidade'],
                    ];

                    if ($produto->estoque !== null) {
                        $produto->decrement('estoque', $item['quantidade']);
                    }
                }

                $valorTotal += (float) ($valorFrete ?? 0);

                $pedido = Pedido::create([
                    'nome_cliente' => $dados['nome_cliente'],
                    'telefone_cliente' => $dados['telefone_cliente'],
                    'endereco' => $dados['endereco'],
                    'cidade_entrega_id' => $cidade?->id,
                    'cidade_texto_livre' => $cidade ? null : ($dados['cidade_texto_livre'] ?? null),
                    'frete_a_combinar' => $dados['frete_a_combinar'],
                    'valor_frete' => $valorFrete,
                    'valor_total' => $valorTotal,
                    'status' => 'AGUARDANDO',
                ]);

                foreach ($itensParaCriar as $item) {
                    PedidoItem::create([...$item, 'pedido_id' => $pedido->id]);
                }

                return $pedido;
            });
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $orderNsu = 'pedido-' . $pedido->id . '-' . Str::random(6);
        $redirectUrl = rtrim(config('services.infinitepay.redirect_url'), '/') . '?pedido=' . $pedido->id;

        $infinitePay = new InfinitePayService($pedido->id);
        $resultado = $infinitePay->gerarLinkPagamento(
            itens: [['quantidade' => 1, 'valor' => (float) $pedido->valor_total, 'descricao' => "Pedido #{$pedido->id}"]],
            orderNsu: $orderNsu,
            dadosCliente: ['nome' => $pedido->nome_cliente, 'telefone' => $pedido->telefone_cliente],
            redirectUrlCustom: $redirectUrl,
        );

        if ($resultado['erro']) {
            return response()->json(['message' => $resultado['mensagem']], 502);
        }

        $pedido->update([
            'infinitepay_link' => $resultado['link'],
            'infinitepay_order_nsu' => $orderNsu,
            'infinitepay_slug' => $resultado['slug'],
        ]);

        try {
            Mail::to(config('mail.from.address'))->send(new NovoPedidoRecebido($pedido));
        } catch (\Throwable $e) {
            Log::warning('Falha ao enviar e-mail de novo pedido: ' . $e->getMessage());
        }

        return response()->json(['link' => $resultado['link']]);
    }

    /**
     * Verificacao manual de status na tela de retorno - dupla checagem
     * alem do webhook, caso ele atrase.
     */
    public function verificarStatus(int $id): JsonResponse
    {
        $pedido = Pedido::findOrFail($id);

        if ($pedido->status !== 'PAGO' && $pedido->infinitepay_order_nsu) {
            $infinitePay = new InfinitePayService($pedido->id);
            $resultado = $infinitePay->verificarPagamento(
                $pedido->infinitepay_order_nsu,
                $pedido->infinitepay_transaction_nsu,
                $pedido->infinitepay_slug,
            );

            if (! $resultado['erro'] && $resultado['paid']) {
                $pedido->confirmarPagamento($resultado['capture_method'] === 'pix' ? 'PIX' : 'CARTAO');
            }
        }

        return response()->json(['status' => $pedido->fresh()->status]);
    }
}
