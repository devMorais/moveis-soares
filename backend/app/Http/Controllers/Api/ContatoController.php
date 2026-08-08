<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NovaMensagemContato;
use App\Models\ConfiguracaoSite;
use App\Models\MensagemContato;
use App\Suporte\Helpers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContatoController extends Controller
{
    public function enviar(Request $request): JsonResponse
    {
        if (!empty($request->input('empresa'))) {
            return response()->json(Helpers::mensagemSucesso('Mensagem enviada com sucesso.'), 201);
        }

        $dados = $request->validate([
            'nome' => 'required|string|max:255',
            'telefone' => 'required|string|max:30',
            'email' => 'nullable|email|max:255',
            'mensagem' => 'required|string|max:2000',
        ]);

        $mensagem = MensagemContato::create($dados);

        $destinatario = ConfiguracaoSite::instancia()->notificacao_email ?: env('MAIL_CONTATO_TO');

        if ($destinatario) {
            Mail::to($destinatario)->send(new NovaMensagemContato($mensagem));
        }

        return response()->json(Helpers::mensagemSucesso('Mensagem enviada com sucesso.'), 201);
    }
}
