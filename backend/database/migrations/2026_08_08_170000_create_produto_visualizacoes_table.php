<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produto_visualizacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produto_id')->constrained('produtos')->cascadeOnDelete();
            $table->string('ip', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('criado_em')->useCurrent();

            $table->index(['produto_id', 'criado_em']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produto_visualizacoes');
    }
};
