<?php

namespace App\Services\Payment;

use App\Models\PaymentLog;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Request as RequestFacade;

/**
 * Integracao com a API InfinitePay. Logica portada de
 * sistema\Biblioteca\InfinitePay.php + LogPagamentoInfinitepayModelo.php
 * do projeto votar (C:\Users\UITEC\Herd\votar) - mesmo fluxo e mesmo nivel
 * de detalhe de log, trocando curl por Illuminate\Support\Facades\Http.
 *
 * Melhorias sobre o original: retry automatico (2 tentativas) em falha de
 * conexao/timeout antes de desistir - pagamento e critico o bastante pra
 * nao devolver erro na primeira soletrada de rede.
 */
class InfinitePayService
{
    private const ENDPOINT_PAYMENT_CHECK = '/payment_check';
    private const ENDPOINT_CHECKOUT_LINK = '/links';
    private const MAX_TENTATIVAS = 2;

    private string $handle;
    private string $url;
    private ?string $webhookUrl;
    private ?string $redirectUrl;
    private ?int $pedidoId;

    public function __construct(?int $pedidoId = null)
    {
        $this->handle = config('services.infinitepay.handle');
        $this->url = config('services.infinitepay.url');
        $this->webhookUrl = config('services.infinitepay.webhook_url');
        $this->redirectUrl = config('services.infinitepay.redirect_url');
        $this->pedidoId = $pedidoId;
    }

    public function gerarLinkPagamento(array $itens, ?string $orderNsu = null, ?array $dadosCliente = null, ?string $redirectUrlCustom = null): array
    {
        $redirectUrl = $redirectUrlCustom ?? $this->redirectUrl;

        $payload = array_filter([
            'handle' => $this->handle,
            'items' => $this->formatarItens($itens),
            'order_nsu' => $orderNsu,
            'webhook_url' => $this->webhookUrl,
            'redirect_url' => $redirectUrl,
            'customer' => $dadosCliente ? $this->formatarDadosCliente($dadosCliente) : null,
        ], fn ($v) => $v !== null);

        $resposta = $this->request(self::ENDPOINT_CHECKOUT_LINK, $payload, 'criar_link');

        if (! isset($resposta->url)) {
            return ['erro' => true, 'mensagem' => $resposta->message ?? 'Erro ao gerar link de pagamento'];
        }

        return [
            'erro' => false,
            'link' => $resposta->url,
            'order_nsu' => $orderNsu,
            'slug' => $resposta->slug ?? null,
        ];
    }

    public function verificarPagamento(string $orderNsu, ?string $transactionNsu = null, ?string $slug = null): array
    {
        $payload = ['handle' => $this->handle, 'order_nsu' => $orderNsu];

        if ($transactionNsu) $payload['transaction_nsu'] = $transactionNsu;
        if ($slug) $payload['slug'] = $slug;

        $resposta = $this->request(self::ENDPOINT_PAYMENT_CHECK, $payload, 'verificar_pagamento');

        if (! isset($resposta->success)) {
            return ['erro' => true, 'paid' => false, 'mensagem' => $resposta->message ?? 'Erro na checagem de pagamento'];
        }

        return [
            'erro' => false,
            'paid' => $resposta->paid ?? false,
            'capture_method' => $resposta->capture_method ?? 'card',
        ];
    }

    /**
     * Executa a requisicao HTTP com ate MAX_TENTATIVAS em caso de falha de
     * conexao/timeout, registrando SEMPRE um log (sucesso, erro de negocio
     * ou erro de rede) antes de retornar.
     */
    private function request(string $endpoint, array $dados, string $etapa): object
    {
        $tempoInicio = microtime(true);
        $tentativa = 0;
        $ultimoErroConexao = null;

        while ($tentativa < self::MAX_TENTATIVAS) {
            $tentativa++;

            try {
                $resposta = Http::timeout(20)
                    ->withHeaders(['Content-Type' => 'application/json'])
                    ->post($this->url . $endpoint, $dados);

                return $this->registrarLog(
                    etapa: $etapa,
                    dados: $dados,
                    endpoint: $endpoint,
                    httpCode: $resposta->status(),
                    respostaObj: $resposta->object(),
                    tempoInicio: $tempoInicio,
                );
            } catch (ConnectionException $e) {
                $ultimoErroConexao = $e->getMessage();
                // tenta de novo se ainda tiver tentativa disponivel
            }
        }

        return $this->registrarLog(
            etapa: $etapa,
            dados: $dados,
            endpoint: $endpoint,
            httpCode: null,
            respostaObj: null,
            tempoInicio: $tempoInicio,
            mensagemErroConexao: $ultimoErroConexao,
        );
    }

    private function registrarLog(
        string $etapa,
        array $dados,
        string $endpoint,
        ?int $httpCode,
        ?object $respostaObj,
        float $tempoInicio,
        ?string $mensagemErroConexao = null,
    ): object {
        $tempoResposta = (int) round((microtime(true) - $tempoInicio) * 1000);
        $sucesso = $httpCode !== null && $httpCode >= 200 && $httpCode < 300 && $mensagemErroConexao === null;

        $mensagem = $mensagemErroConexao ?? $respostaObj->message ?? null;
        $codigoErro = $sucesso ? null : ($respostaObj->error ?? $respostaObj->code ?? null);

        PaymentLog::create([
            'pedido_id' => $this->pedidoId,
            'etapa' => $etapa,
            'status' => $sucesso ? 'SUCESSO' : 'ERRO',
            'mensagem' => $mensagem,
            'codigo_erro' => $codigoErro,
            'request_data' => $this->sanitizarDados($dados),
            'response_data' => $respostaObj ? (array) $respostaObj : null,
            'infinitepay_slug' => $respostaObj->slug ?? $respostaObj->invoice_slug ?? null,
            'infinitepay_link' => $respostaObj->url ?? null,
            'transaction_nsu' => $dados['transaction_nsu'] ?? null,
            'order_nsu' => $dados['order_nsu'] ?? null,
            'endpoint' => $this->url . $endpoint,
            'http_code' => $httpCode,
            'tempo_resposta_ms' => $tempoResposta,
            'ip_usuario' => RequestFacade::ip(),
            'user_agent' => RequestFacade::userAgent(),
        ]);

        if ($mensagemErroConexao) {
            return (object) ['error' => 'connection_error', 'message' => $mensagemErroConexao];
        }

        return $respostaObj ?? (object) ['error' => 'json_error', 'message' => 'Resposta inválida da InfinitePay'];
    }

    /**
     * Remove/mascara dados sensiveis antes de gravar no log - nunca grava
     * numero de cartao, CVV, email ou telefone completos em claro.
     */
    private function sanitizarDados(array $dados): array
    {
        $sanitizado = $dados;

        if (isset($sanitizado['customer']['creditCard']['number'])) {
            $numero = $sanitizado['customer']['creditCard']['number'];
            $sanitizado['customer']['creditCard']['number'] = substr($numero, 0, 4) . '****' . substr($numero, -4);
        }

        if (isset($sanitizado['customer']['creditCard']['cvv'])) {
            $sanitizado['customer']['creditCard']['cvv'] = '***';
        }

        if (isset($sanitizado['customer']['email'])) {
            $partes = explode('@', $sanitizado['customer']['email']);
            if (count($partes) === 2) {
                $sanitizado['customer']['email'] = substr($partes[0], 0, 3) . '***@' . $partes[1];
            }
        }

        if (isset($sanitizado['customer']['phone_number'])) {
            $telefone = $sanitizado['customer']['phone_number'];
            $sanitizado['customer']['phone_number'] = substr($telefone, 0, 5) . '****' . substr($telefone, -2);
        }

        return $sanitizado;
    }

    private function formatarItens(array $itens): array
    {
        return array_map(fn ($i) => [
            'quantity' => $i['quantidade'] ?? 1,
            'price' => (int) round(($i['valor'] ?? 0) * 100), // centavos
            'description' => $i['descricao'] ?? 'Produto',
        ], $itens);
    }

    private function formatarDadosCliente(array $d): array
    {
        return [
            'name' => $d['nome'] ?? '',
            'phone_number' => preg_replace('/\D/', '', $d['telefone'] ?? ''),
        ];
    }
}
