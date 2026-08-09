<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Blocos de call-to-action reutilizados em mais de uma pagina publica -
     * 'chave' identifica onde aparece (hoje: 'home', 'sobre').
     */
    public function up(): void
    {
        Schema::create('secao_cta', function (Blueprint $table) {
            $table->id();
            $table->string('chave')->unique();
            $table->string('titulo')->nullable();
            $table->text('texto')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('secao_cta');
    }
};
