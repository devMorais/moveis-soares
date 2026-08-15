<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produto extends Model
{
    use HasFactory;

    protected $fillable = [
        'categoria_id',
        'nome',
        'slug',
        'preco',
        'preco_de',
        'imagem_url',
        'imagens',
        'especificacao',
        'descricao',
        'altura_cm',
        'largura_cm',
        'profundidade_cm',
        'selo',
        'estoque',
        'ativo',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'preco_de' => 'decimal:2',
        'ativo' => 'boolean',
        'imagens' => 'array',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    public function visualizacoes(): HasMany
    {
        return $this->hasMany(ProdutoVisualizacao::class);
    }

    public function scopeAtivos(Builder $query): Builder
    {
        return $query->where('ativo', true);
    }

    /**
     * Aplica a ordenacao escolhida pelo admin (Configuracoes > Catalogo) em
     * qualquer listagem paginada do site - home e categoria usam o mesmo
     * criterio. "aleatoria" usa a data de hoje como seed pro RAND() do
     * MySQL: assim o embaralhamento fica estavel ao longo do dia (sem isso,
     * cada pagina de "carregar mais" sortearia uma ordem diferente e
     * duplicaria/pularia produtos entre as paginas).
     */
    public function scopeOrdenarConforme(Builder $query, string $ordenacao): Builder
    {
        return match ($ordenacao) {
            'antigos' => $query->orderBy('id'),
            'alfabetica' => $query->orderBy('nome'),
            'aleatoria' => $query->inRandomOrder((string) now()->startOfDay()->timestamp),
            default => $query->orderByDesc('id'),
        };
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
            'imagens' => $this->imagens,
            'especificacao' => $this->especificacao,
            'descricao' => $this->descricao,
            'alturaCm' => $this->altura_cm,
            'larguraCm' => $this->largura_cm,
            'profundidadeCm' => $this->profundidade_cm,
            'selo' => $this->selo,
            'estoque' => $this->estoque,
            'ativo' => $this->ativo,
            'totalVisualizacoes' => $this->visualizacoes_count ?? null,
        ];
    }
}
