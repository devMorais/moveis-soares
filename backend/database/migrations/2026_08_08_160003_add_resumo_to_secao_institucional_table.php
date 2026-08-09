<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Texto curto do bloco "Quem somos" da home - diferente do texto
     * completo de secao_sobre.texto_historia, usado na pagina /sobre.
     */
    public function up(): void
    {
        Schema::table('secao_institucional', function (Blueprint $table) {
            $table->string('resumo_titulo')->nullable()->after('itens');
            $table->text('resumo_texto')->nullable()->after('resumo_titulo');
        });
    }

    public function down(): void
    {
        Schema::table('secao_institucional', function (Blueprint $table) {
            $table->dropColumn(['resumo_titulo', 'resumo_texto']);
        });
    }
};
