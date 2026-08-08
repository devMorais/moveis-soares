<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecaoSobre extends Model
{
    protected $table = 'secao_sobre';

    protected $fillable = [
        'titulo_historia',
        'texto_historia',
        'imagem_url',
    ];
}
