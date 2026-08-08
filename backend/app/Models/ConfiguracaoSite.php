<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConfiguracaoSite extends Model
{
    protected $table = 'configuracoes_site';

    protected $fillable = [
        'modulos_habilitados',
    ];

    protected $casts = [
        'modulos_habilitados' => 'array',
    ];

    /**
     * Retorna o array de modulos habilitados da (unica) linha de
     * configuracao, criando-a com os defaults abaixo se ainda nao existir.
     */
    public static function modulos(): array
    {
        $config = static::first();

        if (! $config) {
            $config = static::create([
                'modulos_habilitados' => [
                    'instagram' => false,
                ],
            ]);
        }

        return $config->modulos_habilitados ?? [];
    }
}
