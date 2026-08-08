<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->string('nome_cliente');
            $table->string('telefone_cliente');
            $table->string('endereco');
            $table->foreignId('cidade_entrega_id')->nullable()->constrained('cidades_entrega')->nullOnDelete();
            $table->string('cidade_texto_livre')->nullable();
            $table->boolean('frete_a_combinar')->default(false);
            $table->decimal('valor_frete', 8, 2)->nullable();
            $table->decimal('valor_total', 10, 2);
            $table->enum('status', ['AGUARDANDO', 'PAGO', 'EM_PREPARACAO', 'ENVIADO', 'ENTREGUE'])->default('AGUARDANDO');
            $table->string('metodo_pagamento')->nullable();
            $table->string('infinitepay_link')->nullable();
            $table->string('infinitepay_order_nsu')->nullable();
            $table->string('infinitepay_transaction_nsu')->nullable();
            $table->string('infinitepay_slug')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};
