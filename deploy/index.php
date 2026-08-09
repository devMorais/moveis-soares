<?php
if (isset($_SERVER['REDIRECT_URL'])) {
    $_SERVER['REQUEST_URI'] = $_SERVER['REDIRECT_URL'];
}

// A aplicacao Laravel fica fisicamente numa subpasta (api/), mas as rotas
// internas (routes/api.php) ja sao prefixadas com "api/" pelo proprio
// framework (withRouting(api: ...)). O Symfony HttpFoundation calcula o
// basePath comparando SCRIPT_NAME com REQUEST_URI e, como SCRIPT_NAME e
// "/api/index.php", ele descontava "/api" do path ANTES do roteamento,
// duplicando o prefixo e fazendo toda rota cair em 404. Zerar SCRIPT_NAME
// remove esse calculo de base path espuria - a aplicacao trata a URL como
// se estivesse na raiz do dominio, que e como as rotas foram escritas.
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$app->handleRequest(Request::capture());
