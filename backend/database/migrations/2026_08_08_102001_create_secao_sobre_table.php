<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('secao_sobre', function (Blueprint $table) {
            $table->id();
            $table->string('titulo_historia')->nullable();
            $table->text('texto_historia')->nullable();
            $table->string('imagem_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('secao_sobre');
    }
};
