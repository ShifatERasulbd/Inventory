<?php

use App\Http\Controllers\Api\PublicStockController;
use Illuminate\Support\Facades\Route;

Route::middleware('api-key')
	->prefix('public')
	->group(function (): void {
		Route::get('/stocks', [PublicStockController::class, 'index']);
		Route::get('/stocks/1971co-america', [PublicStockController::class, 'america1971co']);
	});
