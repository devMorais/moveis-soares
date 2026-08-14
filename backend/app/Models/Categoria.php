<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categoria extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'slug',
        'imagem_url',
        'ativo',
        'ordem_exibicao',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function produtos(): HasMany
    {
        return $this->hasMany(Produto::class);
    }

    public function scopeAtivas(Builder $query): Builder
    {
        return $query->where('ativo', true);
    }
}
