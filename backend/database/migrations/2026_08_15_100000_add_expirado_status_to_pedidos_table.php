<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE pedidos MODIFY status ENUM('AGUARDANDO', 'PAGO', 'EM_PREPARACAO', 'ENVIADO', 'ENTREGUE', 'FALHOU', 'EXPIRADO') DEFAULT 'AGUARDANDO'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE pedidos MODIFY status ENUM('AGUARDANDO', 'PAGO', 'EM_PREPARACAO', 'ENVIADO', 'ENTREGUE', 'FALHOU') DEFAULT 'AGUARDANDO'");
    }
};
