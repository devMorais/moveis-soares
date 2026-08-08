<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cidades_entrega', function (Blueprint $table) {
            $table->id();
            $table->string('nome_cidade');
            $table->char('uf', 2);
            $table->decimal('valor_frete', 8, 2)->default(0);
            $table->integer('prazo_dias_estimado')->nullable();
            $table->boolean('eh_retirada_local')->default(false);
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cidades_entrega');
    }
};
