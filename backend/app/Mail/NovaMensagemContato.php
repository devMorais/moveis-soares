<?php

namespace App\Mail;

use App\Models\MensagemContato;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NovaMensagemContato extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public MensagemContato $mensagem)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nova mensagem de contato - Site Moveis Soares',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.nova-mensagem-contato',
        );
    }
}
