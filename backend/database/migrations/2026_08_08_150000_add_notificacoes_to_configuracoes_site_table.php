<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuracoes_site', function (Blueprint $table) {
            $table->string('notificacao_email')->nullable()->after('seo_indexar_site');
            $table->string('notificacao_whatsapp')->nullable()->after('notificacao_email');
        });
    }

    public function down(): void
    {
        Schema::table('configuracoes_site', function (Blueprint $table) {
            $table->dropColumn(['notificacao_email', 'notificacao_whatsapp']);
        });
    }
};
