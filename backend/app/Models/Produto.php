<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Produto extends Model
{
    protected $fillable = [
        'categoria_id',
        'nome',
        'slug',
        'preco',
        'preco_de',
        'imagem_url',
        'especificacao',
        'selo',
        'estoque',
        'ativo',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'preco_de' => 'decimal:2',
        'ativo' => 'boolean',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    public function scopeAtivos(Builder $query): Builder
    {
        return $query->where('ativo', true);
    }

    /**
     * Formata o produto no shape esperado pelo frontend (Produto interface):
     * categoria como string (nome), preco/precoDe como number, etc.
     */
    public function paraApi(): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'slug' => $this->slug,
            'categoria' => $this->categoria->nome,
            'categoriaSlug' => $this->categoria->slug,
            'precoDe' => $this->preco_de !== null ? (float) $this->preco_de : null,
            'preco' => (float) $this->preco,
            'imagemUrl' => $this->imagem_url,
            'especificacao' => $this->especificacao,
            'selo' => $this->selo,
            'estoque' => $this->estoque,
        ];
    }
}
