<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Plataforma Electoral Colombia - Backend Core',
        'version' => '1.0.0',
        'api' => url('/api/v1'),
        'docs' => url('/api/documentation'),
    ]);
});
