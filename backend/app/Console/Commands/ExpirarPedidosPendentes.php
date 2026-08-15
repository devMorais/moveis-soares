<?php

namespace App\Console\Commands;

use App\Models\Pedido;
use Illuminate\Console\Command;

/**
 * Cancela pedidos parados em "aguardando pagamento" ha mais tempo que
 * Pedido::LIMITE_RESERVA_MINUTOS e devolve o estoque reservado - sem isso
 * um pedido nunca pago prende o produto pra sempre (ver MS-PED-10/12).
 */
class ExpirarPedidosPendentes extends Command
{
    protected $signature = 'pedidos:expirar-pendentes';

    protected $description = 'Cancela pedidos aguardando pagamento ha mais tempo que o limite de reserva e devolve o estoque';

    public function handle(): int
    {
        $pedidos = Pedido::where('status', 'AGUARDANDO')
            ->where('created_at', '<=', now()->subMinutes(Pedido::LIMITE_RESERVA_MINUTOS))
            ->get();

        foreach ($pedidos as $pedido) {
            $pedido->liberarEstoqueEMudarStatus('EXPIRADO');
        }

        $this->info("{$pedidos->count()} pedido(s) expirado(s).");

        return self::SUCCESS;
    }
}
