<?php
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\ConteudoController;
use App\Http\Controllers\Api\Admin\SecoesController;
use App\Http\Controllers\Api\ConfiguracaoController;
use App\Http\Controllers\Api\ContatoController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ProdutoController;
use App\Http\Controllers\Api\SiteController;
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
Route::get('/site', [SiteController::class, 'conteudo']);

Route::post('/admin/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/conteudo/{slug}', [ConteudoController::class, 'mostrar']);
    Route::put('/conteudo/{slug}', [ConteudoController::class, 'atualizar']);

    Route::get('/secoes', [SecoesController::class, 'listar']);
    Route::patch('/secoes', [SecoesController::class, 'atualizar']);
});
