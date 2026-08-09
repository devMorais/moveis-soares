<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Os 3 itens de destaque da home (hoje: "Entrega combinada com voce",
     * "Qualidade que voce ve", "Atendimento proximo") - icone fixo por
     * posicao no frontend, so titulo/texto administraveis.
     */
    public function up(): void
    {
        Schema::create('secao_institucional', function (Blueprint $table) {
            $table->id();
            $table->json('itens')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('secao_institucional');
    }
};
