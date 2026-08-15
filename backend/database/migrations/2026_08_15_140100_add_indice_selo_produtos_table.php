<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Indice dedicado pra busca de produtos em destaque (selo preenchido) -
 * o indice (ativo, id) nao ajuda esse filtro porque "selo" e raro (a
 * imensa maioria dos produtos nao tem selo), entao sem esse indice o
 * banco teria que varrer produto por produto ate achar 10 com selo.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            $table->index(['ativo', 'selo', 'id'], 'produtos_ativo_selo_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            $table->dropIndex('produtos_ativo_selo_id_index');
        });
    }
};
