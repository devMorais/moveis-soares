<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecaoInstitucional extends Model
{
    protected $table = 'secao_institucional';

    protected $fillable = [
        'itens',
        'resumo_titulo',
        'resumo_texto',
    ];

    protected $casts = [
        'itens' => 'array',
    ];
}
