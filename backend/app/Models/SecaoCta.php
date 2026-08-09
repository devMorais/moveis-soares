<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecaoCta extends Model
{
    protected $table = 'secao_cta';

    protected $fillable = [
        'chave',
        'titulo',
        'texto',
    ];
}
