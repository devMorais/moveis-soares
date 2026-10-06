<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            // Versao grande da foto do produto (proporcao original, lado maior
            // limitado a 1600px), usada pro zoom da pagina do produto
            // (MS-IMG-06). Nullable = produto antigo, que so tem a versao
            // quadrada 800x800 em imagem_url; ganha a versao grande quando a
            // foto for reenviada pelo painel.
            $table->string('imagem_original_url')->nullable()->after('imagem_url');
        });
    }

    public function down(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            $table->dropColumn('imagem_original_url');
        });
    }
};