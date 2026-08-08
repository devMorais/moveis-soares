<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuracoes_site', function (Blueprint $table) {
            $table->string('seo_titulo_site')->nullable()->after('modulos_habilitados');
            $table->string('seo_titulo_padrao')->nullable()->after('seo_titulo_site');
            $table->text('seo_descricao_padrao')->nullable()->after('seo_titulo_padrao');
            $table->string('seo_palavras_chave')->nullable()->after('seo_descricao_padrao');
            $table->string('seo_og_image_url')->nullable()->after('seo_palavras_chave');
            $table->string('seo_favicon_url')->nullable()->after('seo_og_image_url');
            $table->string('seo_google_analytics_id')->nullable()->after('seo_favicon_url');
            $table->string('seo_google_search_console_tag')->nullable()->after('seo_google_analytics_id');
            $table->boolean('seo_indexar_site')->default(true)->after('seo_google_search_console_tag');
        });
    }

    public function down(): void
    {
        Schema::table('configuracoes_site', function (Blueprint $table) {
            $table->dropColumn([
                'seo_titulo_site',
                'seo_titulo_padrao',
                'seo_descricao_padrao',
                'seo_palavras_chave',
                'seo_og_image_url',
                'seo_favicon_url',
                'seo_google_analytics_id',
                'seo_google_search_console_tag',
                'seo_indexar_site',
            ]);
        });
    }
};
