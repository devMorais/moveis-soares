<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Novo status FALHOU: usado quando o pedido e o decremento de estoque ja
 * foram confirmados no banco mas a geracao do link de pagamento na
 * InfinitePay falhou (rede, credencial, etc) - sem isso o pedido ficava
 * preso em AGUARDANDO sem link e sem forma de o cliente pagar, e o
 * estoque decrementado nunca era devolvido.
 *
 * Usa DB::statement() (ALTER TABLE ... MODIFY) em vez de Schema::change()
 * porque o projeto nao tem doctrine/dbal instalado.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE pedidos MODIFY status ENUM('AGUARDANDO', 'PAGO', 'EM_PREPARACAO', 'ENVIADO', 'ENTREGUE', 'FALHOU') DEFAULT 'AGUARDANDO'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE pedidos MODIFY status ENUM('AGUARDANDO', 'PAGO', 'EM_PREPARACAO', 'ENVIADO', 'ENTREGUE') DEFAULT 'AGUARDANDO'");
    }
};
