<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('secao_contato', function (Blueprint $table) {
            $table->id();
            $table->string('telefone_display')->nullable();
            $table->string('telefone_whatsapp')->nullable();
            $table->string('email')->nullable();
            $table->string('endereco')->nullable();
            $table->string('horario')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('secao_contato');
    }
};
