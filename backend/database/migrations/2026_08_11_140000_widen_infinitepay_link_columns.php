<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * A URL real de checkout da InfinitePay carrega um token de criptografia
 * (query param "lenc") e passa facilmente de 255 caracteres - a coluna
 * string() (varchar 255) original truncava e derrubava um SQLSTATE 22001
 * ao tentar salvar. So foi pego ao testar com credenciais reais pela
 * primeira vez (11/08/2026) - nunca tinha rodado de ponta a ponta antes.
 *
 * Usa DB::statement() (ALTER TABLE ... MODIFY) em vez de Schema::change()
 * porque o projeto nao tem doctrine/dbal instalado. MODIFY e sintaxe
 * exclusiva do MySQL (o driver real de producao/dev) -- no SQLite (usado
 * pela suite de testes) uma coluna VARCHAR ja nao impoe limite de
 * tamanho de verdade, entao nao ha nada pra "alargar": pulamos a
 * instrucao nesse driver em vez de quebrar com erro de sintaxe.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('ALTER TABLE pedidos MODIFY infinitepay_link TEXT NULL');
        DB::statement('ALTER TABLE payment_logs MODIFY infinitepay_link TEXT NULL');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('ALTER TABLE pedidos MODIFY infinitepay_link VARCHAR(255) NULL');
        DB::statement('ALTER TABLE payment_logs MODIFY infinitepay_link VARCHAR(255) NULL');
    }
};
