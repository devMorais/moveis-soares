<?php
if (isset($_SERVER['REDIRECT_URL'])) {
    $_SERVER['REQUEST_URI'] = $_SERVER['REDIRECT_URL'];
}

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$app->handleRequest(Request::capture());
