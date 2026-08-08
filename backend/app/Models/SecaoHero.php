<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecaoHero extends Model
{
    protected $table = 'secao_hero';

    protected $fillable = [
        'titulo',
        'subtitulo',
    ];
}
