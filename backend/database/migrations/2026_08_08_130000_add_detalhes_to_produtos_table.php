<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            $table->text('descricao')->nullable()->after('especificacao');
            $table->json('imagens')->nullable()->after('imagem_url');
            $table->unsignedInteger('altura_cm')->nullable()->after('descricao');
            $table->unsignedInteger('largura_cm')->nullable()->after('altura_cm');
            $table->unsignedInteger('profundidade_cm')->nullable()->after('largura_cm');
        });
    }

    public function down(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            $table->dropColumn(['descricao', 'imagens', 'altura_cm', 'largura_cm', 'profundidade_cm']);
        });
    }
};
