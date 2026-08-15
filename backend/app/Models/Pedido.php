<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Pedido extends Model
{
    /**
     * Minutos que o estoque fica reservado pra um pedido "aguardando
     * pagamento" antes de ser cancelado automaticamente e o estoque
     * devolvido. Mesmo padrao usado pelo WooCommerce (Hold stock).
     */
    public const LIMITE_RESERVA_MINUTOS = 60;

    protected $fillable = [
        'token_acompanhamento',
        'nome_cliente',
        'telefone_cliente',
        'endereco',
        'observacoes',
        'cidade_entrega_id',
        'cidade_texto_livre',
        'frete_a_combinar',
        'valor_frete',
        'valor_total',
        'status',
        'atendente_id',
        'metodo_pagamento',
        'infinitepay_link',
        'infinitepay_order_nsu',
        'infinitepay_transaction_nsu',
        'infinitepay_slug',
    ];

    protected $casts = [
        'frete_a_combinar' => 'boolean',
        'valor_frete' => 'decimal:2',
        'valor_total' => 'decimal:2',
    ];

    public function itens(): HasMany
    {
        return $this->hasMany(PedidoItem::class)->with('produto:id,slug,imagem_url');
    }

    public function cidadeEntrega(): BelongsTo
    {
        return $this->belongsTo(CidadeEntrega::class, 'cidade_entrega_id');
    }

    public function atendente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atendente_id');
    }

    /**
     * Marca o pedido como pago - idempotente (nao reprocessa se ja
     * estiver pago), usado tanto pelo webhook quanto pela verificacao
     * manual na tela de retorno.
     */
    public function confirmarPagamento(string $metodo): void
    {
        if ($this->status === 'PAGO') {
            return;
        }

        $this->update([
            'status' => 'PAGO',
            'metodo_pagamento' => $metodo,
        ]);
    }

    /**
     * Devolve ao estoque as quantidades reservadas pelos itens deste
     * pedido e muda o status - usado tanto quando a geracao do link de
     * pagamento falha na hora (FALHOU) quanto quando o pedido fica
     * "aguardando" tempo demais sem pagamento (EXPIRADO).
     */
    public function liberarEstoqueEMudarStatus(string $status): void
    {
        DB::transaction(function () use ($status) {
            $itens = $this->itens()->get();
            $produtos = Produto::whereIn('id', $itens->pluck('produto_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($itens as $item) {
                $produto = $produtos->get($item->produto_id);

                if ($produto && $produto->estoque !== null) {
                    $produto->increment('estoque', $item->quantidade);
                }
            }

            $this->update(['status' => $status]);
        });
    }

    public function paraApi(): array
    {
        return [
            'id' => $this->id,
            'tokenAcompanhamento' => $this->token_acompanhamento,
            'nomeCliente' => $this->nome_cliente,
            'telefoneCliente' => $this->telefone_cliente,
            'endereco' => $this->endereco,
            'observacoes' => $this->observacoes,
            'cidade' => $this->cidadeEntrega?->nome_cidade ?? $this->cidade_texto_livre,
            'freteACombinar' => $this->frete_a_combinar,
            'valorFrete' => $this->valor_frete !== null ? (float) $this->valor_frete : null,
            'valorTotal' => (float) $this->valor_total,
            'status' => $this->status,
            'atendente' => $this->atendente ? [
                'id' => $this->atendente->id,
                'name' => $this->atendente->name,
            ] : null,
            'metodoPagamento' => $this->metodo_pagamento,
            'itens' => $this->itens->map(fn (PedidoItem $item) => [
                'nomeProduto' => $item->nome_produto,
                'precoUnitario' => (float) $item->preco_unitario,
                'quantidade' => $item->quantidade,
                'imagemUrl' => $item->produto?->imagem_url,
                'produtoSlug' => $item->produto?->slug,
            ]),
            'criadoEm' => $this->created_at,
        ];
    }
}
