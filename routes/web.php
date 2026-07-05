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
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ReceivedCartoonIssueController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QuickBooksController;
use App\Http\Controllers\RemoteOrderController;
use App\Http\Controllers\ShipStationController;
use App\Http\Controllers\UPSCourierController;
use App\Http\Controllers\ShippingController;

Route::get('/', function () {
    return view('app');
})->name('login');
Route::post('/shipping/orders', [ShipStationController::class, 'storeOrder']);
Route::post('/ups/shipments', [UPSCourierController::class, 'storeShipment']);
Route::prefix('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    // QuickBooks callback must be public because Intuit redirects the user back here.
    Route::get('/quickbooks/callback', [QuickBooksController::class, 'handleCallback'])->name('quickbooks.callback.api');

    // Public webhook from the main store for automatic remote-order ingestion.
    Route::post('/webhooks/order-created', [RemoteOrderController::class, 'handleWebhook']);

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

        // 1971 order details
        Route::get('/remote-orders', [RemoteOrderController::class, 'index']);
        Route::get('/remote-orders/pending', [RemoteOrderController::class, 'getPendingOrders']);
        Route::post('/remote-orders/sync', [RemoteOrderController::class, 'sync']);
        Route::get('/remote-orders/{id}', [RemoteOrderController::class, 'show'])->whereNumber('id');
        Route::put('/remote-orders/{id}', [RemoteOrderController::class, 'update'])->whereNumber('id');
        Route::post('/remote-orders/bulk-status', [RemoteOrderController::class, 'bulkUpdateStatus']);
        Route::post('/remote-orders/bulk-delete', [RemoteOrderController::class, 'bulkDelete']);
        
        // QuickBooks Routes
        Route::get('/quickbooks/connect', [QuickBooksController::class, 'getAuthUrl']);
        Route::get('/quickbooks/reconnect', [QuickBooksController::class, 'reconnect']);
        Route::get('/quickbooks/status', [QuickBooksController::class, 'getConnectionStatus']);
        Route::get('/quickbooks/troubleshoot', [QuickBooksController::class, 'troubleshoot']);
        Route::post('/quickbooks/retry-retail-sales-sync', [QuickBooksController::class, 'retryRetailSalesSync']);
        
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

        // Shipping Time Controller
        Route::apiResource('/shipments', ShippingController::class)->middleware('resource.permission:shipments');

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
        Route::post('/stocks/locations', [StockController::class, 'locations'])->middleware('resource.permission:stocks');
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
            Route::get('/activity-logs', [ActivityLogController::class, 'index']);
        });
    });
});

// Backward-compatible callback path in case the Intuit app still points to /quickbooks/callback.
Route::get('/quickbooks/callback', [QuickBooksController::class, 'handleCallback'])->name('quickbooks.callback');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/quickbooks/connect', function () {
        return view('app');
    });

    Route::get('/quickbook/connect', function () {
        return view('app');
    });

    Route::get('/{path}', function () {
        return view('app');
    })->where('path', '^(?!api\/).*$');
});
