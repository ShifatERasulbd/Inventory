<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StateController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
})->name('login');

Route::prefix('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return response()->json(
                $request->user()->load('warehouse:id,name', 'roles.permissions:id,name,slug')
            );
        });

        Route::post('/logout', [AuthController::class, 'logout']);
        // Country Controller
        Route::apiResource('/countries', CountryController::class);

        // State Controller
        Route::apiResource('/states',StateController::class);

        // Warehouse Controller
        Route::apiResource('/warehouses',WarehouseController::class);

        // User Controller
        Route::apiResource('/users', UserController::class);

        Route::middleware('super-admin')->group(function () {
            Route::get('/permissions', [PermissionController::class, 'index']);
            Route::apiResource('/roles', RoleController::class);
            Route::put('/users/{user}/roles', [UserController::class, 'syncRoles']);
        });
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/{path}', function () {
        return view('app');
    })->where('path', '^(?!api).*$');
});
