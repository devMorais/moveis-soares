<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProdutoVisualizacao extends Model
{
    protected $table = 'produto_visualizacoes';

    public $timestamps = false;

    protected $fillable = [
        'produto_id',
        'ip',
        'user_agent',
        'criado_em',
    ];

    protected $casts = [
        'criado_em' => 'datetime',
    ];

    public function produto(): BelongsTo
    {
        return $this->belongsTo(Produto::class);
    }
}
