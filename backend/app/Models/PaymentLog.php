<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class PaymentLog extends Model
{
    protected $table = 'payment_logs';

    protected $fillable = [
        'pedido_id',
        'etapa',
        'status',
        'mensagem',
        'codigo_erro',
        'request_data',
        'response_data',
        'infinitepay_slug',
        'infinitepay_link',
        'transaction_nsu',
        'order_nsu',
        'endpoint',
        'http_code',
        'tempo_resposta_ms',
        'ip_usuario',
        'user_agent',
    ];

    protected $casts = [
        'request_data' => 'array',
        'response_data' => 'array',
    ];

    public function scopeDoPedido(Builder $query, int $pedidoId): Builder
    {
        return $query->where('pedido_id', $pedidoId);
    }

    public function scopeComErro(Builder $query): Builder
    {
        return $query->where('status', 'ERRO');
    }

    public function scopePorOrderNsu(Builder $query, string $orderNsu): Builder
    {
        return $query->where('order_nsu', $orderNsu);
    }

    public function scopePorSlug(Builder $query, string $slug): Builder
    {
        return $query->where('infinitepay_slug', $slug);
    }
}
