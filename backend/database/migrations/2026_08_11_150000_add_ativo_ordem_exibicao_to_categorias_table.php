<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->boolean('ativo')->default(true)->after('imagem_url');
            $table->unsignedInteger('ordem_exibicao')->default(0)->after('ativo');
        });
    }

    public function down(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->dropColumn(['ativo', 'ordem_exibicao']);
        });
    }
};
