<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            // Adicionado como pre-requisito do checkout (MS-PED-04): sem
            // controle de estoque nao da pra decrementar com seguranca ao
            // fechar um pedido. Nullable = estoque ilimitado/nao controlado
            // (mesma semantica ja usada no frontend, ver Produto.type.ts).
            $table->integer('estoque')->nullable()->after('selo');
        });
    }

    public function down(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            $table->dropColumn('estoque');
        });
    }
};
