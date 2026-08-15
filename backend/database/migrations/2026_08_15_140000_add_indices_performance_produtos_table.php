<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Indices compostos pra sustentar as consultas mais pesadas do catalogo
 * (home e categoria, listagem paginada por "ativo" e ordenada por "id")
 * em volume grande, sem cair pra table scan. A ordem das colunas segue
 * a ordem de uso na query: filtro primeiro, ordenacao por ultimo.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            $table->index(['ativo', 'id'], 'produtos_ativo_id_index');
            $table->index(['categoria_id', 'ativo', 'id'], 'produtos_categoria_ativo_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            $table->dropIndex('produtos_ativo_id_index');
            $table->dropIndex('produtos_categoria_ativo_id_index');
        });
    }
};
