<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        /**
         * Toda resposta de erro da API segue o mesmo formato
         * {mensagem, tipo, erros?} - o ToastService do frontend sempre
         * consegue exibir de forma consistente, sem tratar cada endpoint
         * de um jeito diferente.
         */
        $exceptions->render(function (\Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            if ($e instanceof ValidationException) {
                return new JsonResponse([
                    'mensagem' => $e->getMessage(),
                    'tipo' => 'erro',
                    'erros' => $e->errors(),
                ], 422);
            }

            if ($e instanceof AuthenticationException) {
                return new JsonResponse([
                    'mensagem' => 'É necessário estar autenticado.',
                    'tipo' => 'erro',
                ], 401);
            }

            if ($e instanceof AuthorizationException) {
                return new JsonResponse([
                    'mensagem' => $e->getMessage() ?: 'Você não tem permissão para acessar este recurso.',
                    'tipo' => 'erro',
                ], 403);
            }

            if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
                return new JsonResponse([
                    'mensagem' => 'Recurso não encontrado.',
                    'tipo' => 'erro',
                ], 404);
            }

            if ($e instanceof ThrottleRequestsException) {
                return new JsonResponse([
                    'mensagem' => 'Muitas tentativas. Aguarde um momento e tente novamente.',
                    'tipo' => 'erro',
                ], 429);
            }

            /**
             * Sem branch generico pra \RuntimeException aqui de proposito:
             * QueryException e ThrottleRequestsException (ja tratada acima)
             * tambem estendem RuntimeException, e um branch generico
             * devolvia $e->getMessage() cru pra qualquer uma delas - vazando
             * SQL/host/porta/banco de producao numa query mal sucedida.
             * RuntimeException usada de proposito pra erro de negocio (ver
             * PedidoController::store) ja e capturada localmente com sua
             * propria mensagem amigavel antes de chegar aqui.
             */
            $debug = config('app.debug');

            return new JsonResponse([
                'mensagem' => $debug ? $e->getMessage() : 'Ocorreu um erro inesperado. Tente novamente.',
                'tipo' => 'erro',
            ], 500);
        });
    })->create();
