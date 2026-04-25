<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
})->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/{path}', function () {
        return view('app');
    })->where('path', '.*');
});

Route::prefix('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return response()->json($request->user());
        });

        Route::post('/logout', [AuthController::class, 'logout']);
    });
});
