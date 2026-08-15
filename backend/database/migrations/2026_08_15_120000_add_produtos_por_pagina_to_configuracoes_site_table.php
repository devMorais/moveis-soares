<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuracoes_site', function (Blueprint $table) {
            $table->unsignedSmallInteger('produtos_por_pagina')->default(12)->after('modulos_habilitados');
        });
    }

    public function down(): void
    {
        Schema::table('configuracoes_site', function (Blueprint $table) {
            $table->dropColumn('produtos_por_pagina');
        });
    }
};
