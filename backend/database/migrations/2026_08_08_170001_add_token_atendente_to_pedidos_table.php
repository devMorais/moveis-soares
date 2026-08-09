<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->string('token_acompanhamento')->nullable()->unique()->after('id');
            $table->foreignId('atendente_id')->nullable()->after('status')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('atendente_id');
            $table->dropColumn('token_acompanhamento');
        });
    }
};
