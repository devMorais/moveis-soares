<?php
use App\Http\Controllers\Api\ContatoController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ProdutoController;
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
