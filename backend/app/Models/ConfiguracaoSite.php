<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConfiguracaoSite extends Model
{
    protected $table = 'configuracoes_site';

    protected $fillable = [
        'modulos_habilitados',
        'seo_titulo_site',
        'seo_titulo_padrao',
        'seo_descricao_padrao',
        'seo_palavras_chave',
        'seo_og_image_url',
        'seo_favicon_url',
        'seo_google_analytics_id',
        'seo_google_search_console_tag',
        'seo_indexar_site',
    ];

    protected $casts = [
        'modulos_habilitados' => 'array',
        'seo_indexar_site' => 'boolean',
    ];

    /**
     * Retorna a (unica) linha de configuracao, criando-a com defaults se
     * ainda nao existir - mesmo padrao de modulos().
     */
    public static function instancia(): self
    {
        return static::firstOrCreate([], [
            'modulos_habilitados' => ['instagram' => false],
            'seo_indexar_site' => true,
        ]);
    }

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
