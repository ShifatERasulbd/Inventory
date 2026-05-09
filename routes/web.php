<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductForController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StateController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RackController;
use App\Http\Controllers\RackRowController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\SeasonController;
use App\Http\Controllers\ColorController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\FabricController;
use App\Http\Controllers\SizeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartoonController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SellController;
use App\Http\Controllers\StockController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
})->name('login');

Route::prefix('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [UserController::class, 'me']);

        Route::post('/logout', [AuthController::class, 'logout']);
        // Country Controller
        Route::apiResource('/countries', CountryController::class);

        // State Controller
        Route::apiResource('/states',StateController::class);

        // Warehouse Controller
        Route::apiResource('/warehouses',WarehouseController::class);

        // User Controller
        Route::apiResource('/users', UserController::class);

        // Products For Controller
        Route::apiResource('/products-for', ProductForController::class);

        // Rack Controller
        Route::apiResource('/racks', RackController::class);

        // Rack Row Controller
        Route::apiResource('/racks/{rack}/rows', RackRowController::class);

        // Brand Controller
        Route::apiResource('/brands', BrandController::class);

        // Color Controller
        Route::apiResource('/colors', ColorController::class);

        // Fabric Controller
        Route::apiResource('/fabrics',FabricController::class);

        // Size Controller
        Route::apiResource('/sizes',SizeController::class);

          // supplier Controller
        Route::apiResource('/suppliers',SupplierController::class);
        
        // Product Controller
        Route::post('/products/bulk-delete', [ProductController::class, 'bulkDestroy']);
        Route::apiResource('/products', ProductController::class);

        // Cartoon Controller
        Route::apiResource('/cartoons', CartoonController::class);
        Route::post('/cartoons/{cartoon}/adjust-quantity', [CartoonController::class, 'adjustQuantity']);

        // Stock Controller
        Route::apiResource('/stocks', StockController::class);

        // Purchase Controller
        Route::apiResource('/purchases', PurchaseController::class);
        Route::get('/purchase-requests', [PurchaseController::class, 'getPurchaseRequests']);
        Route::patch('/purchases/{purchase}/status', [PurchaseController::class, 'updateRequestStatus']);

        // Sell Controller
        Route::apiResource('/sells', SellController::class);

        
        // Season Controller
        Route::apiResource('/seasons', SeasonController::class);

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
