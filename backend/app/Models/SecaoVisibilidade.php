<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecaoVisibilidade extends Model
{
    protected $table = 'secoes_visibilidade';

    protected $fillable = [
        'chave',
        'visivel',
        'bloqueada',
    ];

    protected $casts = [
        'visivel' => 'boolean',
        'bloqueada' => 'boolean',
    ];

    /**
     * Chaves de secao conhecidas e seus defaults. 'hero' vem sempre
     * bloqueada=true (o site nao pode ficar sem a home visivel).
     */
    public const SECOES_PADRAO = [
        'hero' => true,
        'sobre' => false,
        'contato' => false,
    ];

    /**
     * Garante que todas as secoes padrao existem no banco (idempotente) e
     * retorna um mapa simples chave => visivel, usado tanto pelo endpoint
     * publico (GET /api/site) quanto pela tela administrativa.
     */
    public static function mapaDeVisibilidade(): array
    {
        foreach (self::SECOES_PADRAO as $chave => $bloqueada) {
            self::firstOrCreate(['chave' => $chave], ['bloqueada' => $bloqueada]);
        }

        return self::all()->pluck('visivel', 'chave')->all();
    }
}
