<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('secao_sobre', function (Blueprint $table) {
            // Array de 4 itens fixos [{titulo, texto}] - o icone de cada
            // posicao fica fixo no frontend, so texto e administravel.
            $table->json('diferenciais')->nullable()->after('imagem_url');
        });
    }

    public function down(): void
    {
        Schema::table('secao_sobre', function (Blueprint $table) {
            $table->dropColumn('diferenciais');
        });
    }
};
