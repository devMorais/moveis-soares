<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pedido extends Model
{
    protected $fillable = [
        'nome_cliente',
        'telefone_cliente',
        'endereco',
        'cidade_entrega_id',
        'cidade_texto_livre',
        'frete_a_combinar',
        'valor_frete',
        'valor_total',
        'status',
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
        return $this->hasMany(PedidoItem::class);
    }

    public function cidadeEntrega(): BelongsTo
    {
        return $this->belongsTo(CidadeEntrega::class, 'cidade_entrega_id');
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

    public function paraApi(): array
    {
        return [
            'id' => $this->id,
            'nomeCliente' => $this->nome_cliente,
            'telefoneCliente' => $this->telefone_cliente,
            'endereco' => $this->endereco,
            'cidade' => $this->cidadeEntrega?->nome_cidade ?? $this->cidade_texto_livre,
            'freteACombinar' => $this->frete_a_combinar,
            'valorFrete' => $this->valor_frete !== null ? (float) $this->valor_frete : null,
            'valorTotal' => (float) $this->valor_total,
            'status' => $this->status,
            'metodoPagamento' => $this->metodo_pagamento,
            'itens' => $this->itens->map(fn (PedidoItem $item) => [
                'nomeProduto' => $item->nome_produto,
                'precoUnitario' => (float) $item->preco_unitario,
                'quantidade' => $item->quantidade,
            ]),
            'criadoEm' => $this->created_at,
        ];
    }
}
