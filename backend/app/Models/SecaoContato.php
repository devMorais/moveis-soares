<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecaoContato extends Model
{
    protected $table = 'secao_contato';

    protected $fillable = [
        'telefone_display',
        'telefone_whatsapp',
        'email',
        'endereco',
        'horario',
    ];
}
