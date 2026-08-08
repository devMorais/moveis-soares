<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('secoes_visibilidade', function (Blueprint $table) {
            $table->id();
            $table->string('chave')->unique();
            $table->boolean('visivel')->default(true);
            $table->boolean('bloqueada')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('secoes_visibilidade');
    }
};
