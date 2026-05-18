<?php

use App\Http\Controllers\Api\PublicStockController;
use Illuminate\Support\Facades\Route;

Route::middleware('api-key')
	->prefix('public')
	->group(function (): void {
		Route::get('/stocks', [PublicStockController::class, 'index']);
	});
