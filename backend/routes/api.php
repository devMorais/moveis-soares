<?php
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\CategoriaController as AdminCategoriaController;
use App\Http\Controllers\Api\Admin\CidadeEntregaController as AdminCidadeEntregaController;
use App\Http\Controllers\Api\Admin\ConfiguracaoSeoController;
use App\Http\Controllers\Api\Admin\ConteudoController;
use App\Http\Controllers\Api\Admin\PedidoController as AdminPedidoController;
use App\Http\Controllers\Api\Admin\ProdutoController as AdminProdutoController;
use App\Http\Controllers\Api\Admin\SecoesController;
use App\Http\Controllers\Api\CidadeEntregaController;
use App\Http\Controllers\Api\ConfiguracaoController;
use App\Http\Controllers\Api\ContatoController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\ProdutoController;
use App\Http\Controllers\Api\SiteController;
use App\Http\Controllers\Api\Webhook\InfinitePayWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/categorias/{slug}/produtos', [CategoriaController::class, 'produtos']);
Route::get('/categorias/{slug}', [CategoriaController::class, 'porSlug']);
Route::post('/produtos/upload-imagem', [ProdutoController::class, 'uploadImagem']);
Route::get('/produtos/categoria/{slug}', [ProdutoController::class, 'porCategoria']);
Route::get('/produtos/{slug}', [ProdutoController::class, 'porSlug']);
Route::get('/produtos', [ProdutoController::class, 'index']);
Route::post('/contato', [ContatoController::class, 'enviar']);
Route::get('/modulos', [ConfiguracaoController::class, 'modulos']);
Route::get('/seo', [ConfiguracaoController::class, 'seo']);
Route::get('/site', [SiteController::class, 'conteudo']);
Route::get('/cidades-entrega', [CidadeEntregaController::class, 'listar']);
Route::post('/pedidos', [PedidoController::class, 'criar']);
Route::get('/pedidos/{id}/status', [PedidoController::class, 'verificarStatus']);
Route::post('/webhooks/infinitepay', [InfinitePayWebhookController::class, 'receber']);

Route::post('/admin/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/conteudo/{slug}', [ConteudoController::class, 'mostrar']);
    Route::put('/conteudo/{slug}', [ConteudoController::class, 'atualizar']);

    Route::get('/secoes', [SecoesController::class, 'listar']);
    Route::patch('/secoes', [SecoesController::class, 'atualizar']);

    Route::get('/cidades-entrega', [AdminCidadeEntregaController::class, 'index']);
    Route::post('/cidades-entrega', [AdminCidadeEntregaController::class, 'store']);
    Route::put('/cidades-entrega/{id}', [AdminCidadeEntregaController::class, 'update']);
    Route::delete('/cidades-entrega/{id}', [AdminCidadeEntregaController::class, 'destroy']);

    Route::get('/pedidos', [AdminPedidoController::class, 'index']);
    Route::get('/pedidos/{id}', [AdminPedidoController::class, 'mostrar']);
    Route::patch('/pedidos/{id}/status', [AdminPedidoController::class, 'atualizarStatus']);

    Route::get('/categorias', [AdminCategoriaController::class, 'index']);
    Route::post('/categorias', [AdminCategoriaController::class, 'store']);
    Route::put('/categorias/{id}', [AdminCategoriaController::class, 'update']);
    Route::delete('/categorias/{id}', [AdminCategoriaController::class, 'destroy']);

    Route::get('/produtos', [AdminProdutoController::class, 'index']);
    Route::get('/produtos/{id}', [AdminProdutoController::class, 'mostrar']);
    Route::post('/produtos', [AdminProdutoController::class, 'store']);
    Route::put('/produtos/{id}', [AdminProdutoController::class, 'update']);
    Route::delete('/produtos/{id}', [AdminProdutoController::class, 'destroy']);

    Route::get('/configuracoes/seo', [ConfiguracaoSeoController::class, 'mostrar']);
    Route::put('/configuracoes/seo', [ConfiguracaoSeoController::class, 'atualizar']);
});
