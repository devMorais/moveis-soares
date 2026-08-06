<?php

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProdutoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/categorias', [CategoriaController::class, 'index']);

Route::post('/produtos/upload-imagem', [ProdutoController::class, 'uploadImagem']);
Route::get('/produtos/categoria/{slug}', [ProdutoController::class, 'porCategoria']);
Route::get('/produtos/{slug}', [ProdutoController::class, 'porSlug']);
Route::get('/produtos', [ProdutoController::class, 'index']);
