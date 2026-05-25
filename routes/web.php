<?php

use App\Http\Controllers\Api\ApiKeyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\RetailController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductForController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StateController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RackController;
use App\Http\Controllers\RackRowController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
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
use App\Http\Controllers\AccountController;
use App\Http\Controllers\RecurringPaymentController;
use App\Http\Controllers\ReceivedCartoonIssueController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
})->name('login');

Route::prefix('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [UserController::class, 'me']);

        Route::post('/logout', [AuthController::class, 'logout']);

        Route::middleware('super-admin')->prefix('/access-keys')->group(function () {
            Route::get('/', [ApiKeyController::class, 'index']);
            Route::post('/', [ApiKeyController::class, 'store']);
            Route::get('/{token}', [ApiKeyController::class, 'show']);
            Route::delete('/{token}', [ApiKeyController::class, 'destroy']);
        });

        // Country Controller
        Route::get('/countries/trashed', [CountryController::class, 'trashed'])->middleware('resource.permission:countries');
        Route::post('/countries/{id}/restore', [CountryController::class, 'restore'])->middleware('resource.permission:countries');
        Route::apiResource('/countries', CountryController::class)->middleware('resource.permission:countries');

        // State Controller
        Route::get('/states/trashed', [StateController::class, 'trashed'])->middleware('resource.permission:states');
        Route::post('/states/{id}/restore', [StateController::class, 'restore'])->middleware('resource.permission:states');
        Route::apiResource('/states', StateController::class)->middleware('resource.permission:states');

        // Warehouse Controller
        Route::apiResource('/warehouses', WarehouseController::class)->middleware('resource.permission:warehouses');

        // User Controller
        Route::apiResource('/users', UserController::class)->middleware('resource.permission:users');

        // Products For Controller
        Route::apiResource('/products-for', ProductForController::class)->middleware('resource.permission:products');

        // Rack Controller
        Route::apiResource('/racks', RackController::class)->middleware('resource.permission:racks');

        // Rack Row Controller
        Route::apiResource('/racks/{rack}/rows', RackRowController::class)->middleware('resource.permission:racks');

        // Brand Controller
        Route::apiResource('/brands', BrandController::class)->middleware('resource.permission:brands');

        // Category Controller
        Route::apiResource('/categories', CategoryController::class)->middleware('resource.permission:categories');

        // Color Controller
        Route::apiResource('/colors', ColorController::class)->middleware('resource.permission:colors');

        // Fabric Controller
        Route::apiResource('/fabrics', FabricController::class)->middleware('resource.permission:fabrics');

        // Size Controller
        Route::apiResource('/sizes', SizeController::class)->middleware('resource.permission:sizes');

        // Supplier Controller
        Route::apiResource('/suppliers', SupplierController::class)->middleware('resource.permission:suppliers');

        // Product Controller
        Route::post('/products/bulk-delete', [ProductController::class, 'bulkDestroy'])->middleware('resource.permission:products');
        Route::apiResource('/products', ProductController::class)->middleware('resource.permission:products');

        // Cartoon Controller
        Route::get('/cartoon-tracking', [CartoonController::class, 'tracking'])->middleware('resource.permission:cartoons');
        Route::get('/received-cartoons', [CartoonController::class, 'receivedQueue'])->middleware('resource.permission:cartoons');
        Route::get('/received-cartoons/issues', [ReceivedCartoonIssueController::class, 'index'])->middleware('resource.permission:cartoons');
        Route::post('/received-cartoons/issues', [ReceivedCartoonIssueController::class, 'store'])->middleware('resource.permission:cartoons');
        Route::post('/received-cartoons/scan', [CartoonController::class, 'receiveByScan'])->middleware('resource.permission:stocks');
        Route::apiResource('/cartoons', CartoonController::class)->middleware('resource.permission:cartoons');
        Route::post('/cartoons/{cartoon}/adjust-quantity', [CartoonController::class, 'adjustQuantity'])->middleware('resource.permission:cartoons');
        Route::post('/cartoons/{cartoon}/assign-rack', [CartoonController::class, 'assignRack'])->middleware('resource.permission:cartoons');

        // Stock Controller
        Route::apiResource('/stocks', StockController::class)->middleware('resource.permission:stocks');

        // Purchase Controller
        Route::get('/purchases/options', [PurchaseController::class, 'getFormOptions'])->middleware('resource.permission:purchases');
        Route::apiResource('/purchases', PurchaseController::class)->middleware('resource.permission:purchases');
        Route::get('/purchase-requests', [PurchaseController::class, 'getPurchaseRequests'])->middleware('resource.permission:purchases');
        Route::patch('/purchases/{purchase}/status', [PurchaseController::class, 'updateRequestStatus'])->middleware('resource.permission:purchases');
        Route::get('/accounts', [AccountController::class, 'index'])->middleware('resource.permission:purchases');
        Route::get('/recurring-payments', [RecurringPaymentController::class, 'index'])->middleware('resource.permission:purchases');
        Route::post('/recurring-payments', [RecurringPaymentController::class, 'store'])->middleware('resource.permission:purchases');

        // Sell Controller
        Route::apiResource('/sells', SellController::class)->middleware('resource.permission:sales');

        // Retail / POS Controller
        Route::get('/retail/barcode-lookup', [RetailController::class, 'lookupBarcode'])->middleware('resource.permission:sales');
        Route::get('/retail/sales', [RetailController::class, 'index'])->middleware('resource.permission:sales');
        Route::post('/retail/sales', [RetailController::class, 'store'])->middleware('resource.permission:sales');

        // Season Controller
        Route::apiResource('/seasons', SeasonController::class)->middleware('resource.permission:seasons');

        Route::middleware('super-admin')->group(function () {
            Route::get('/permissions', [PermissionController::class, 'index']);
            Route::get('/permissions/by-category', [RoleController::class, 'getPermissionsByCategory']);
            Route::apiResource('/roles', RoleController::class);
            Route::put('/users/{user}/roles', [UserController::class, 'syncRoles']);
        });
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/{path}', function () {
        return view('app');
    })->where('path', '^(?!api\/).*$');
});
