<?php

namespace App\Mail;

use App\Models\Pedido;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NovoPedidoRecebido extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Pedido $pedido)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Novo pedido #{$this->pedido->id} recebido",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.novo-pedido-recebido',
            with: ['pedido' => $this->pedido],
        );
    }
}
