<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * secao_hero nunca foi editada por nenhuma tela do admin -- o carrossel
 * "hero" da home e alimentado pelos produtos com selo, nao por essa
 * tabela. GET /api/site sempre devolvia "hero": null. Codigo morto
 * confirmado (nenhum controller/frontend le esse dado), removido.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('secao_hero');
    }

    public function down(): void
    {
        Schema::create('secao_hero', function (Blueprint $table) {
            $table->id();
            $table->string('titulo')->nullable();
            $table->string('subtitulo')->nullable();
            $table->timestamps();
        });
    }
};
