<?php

use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\TextController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\SubcategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\ImageController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\WebController;
use App\Http\Controllers\ShopController;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [WebController::class, 'homepage'])->name('home');
Route::get('/Nosotros', [WebController::class, 'about'])->name('about');
Route::get('/Productos', [WebController::class, 'products'])->name('products');
Route::post('/Productos/Filtrar', [WebController::class, 'products'])->name('products_post');
Route::get('/Marcas/{brand}', [WebController::class, 'products'])->name('brand');
Route::get('/Productos/{category}', [WebController::class, 'products'])->name('category');
Route::get('/Productos/{category}/{subcategory}', [WebController::class, 'products'])->name('subcategory');
Route::get('/Productos/{category}/{subcategory}/{product}', [WebController::class, 'product'])->name('product');
Route::get('/Servicios', [WebController::class, 'services'])->name('services');
Route::get('/Contactanos', [WebController::class, 'contact'])->name('contact');
Route::post('/Enviar', [WebController::class, 'store'])->name('store');
Route::get('/Find', [WebController::class, 'storefind'])->name('storefind');

Route::get('/AddShop/{product}', [ShopController::class, 'add'])->name('addshop');
Route::patch('/Shop/{product}', [ShopController::class, 'update'])->name('updateshop');
Route::get('/RemoveShop/{product}', [ShopController::class, 'remove'])->name('removeshop');

// Rutas del panel de administración con prefijo admin/
Route::prefix('admin')->middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'dashboard'])->name('admin.dashboard');  
    
    // Rutas de usuarios
    Route::resource('/users', UserController::class)->except('show')->names('admin.users');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('admin.users.show');
    Route::get('/users/{user}/password', [UserController::class, 'editPassword'])->name('admin.users.password.edit');
    Route::put('/users/{user}/password', [UserController::class, 'updatePassword'])->name('admin.users.password.update');
    
    // Rutas de roles (solo para administradores)
    Route::middleware('role:admin')->group(function () {
        Route::resource('/roles', RoleController::class)->names('admin.roles');
    });
    
    // Rutas de permisos (solo para administradores)
    Route::middleware('role:admin')->group(function () {
        Route::resource('/permissions', PermissionController::class)->names('admin.permissions');
    });
    
    // Rutas de textos
    Route::resource('/texts', TextController::class)->names('admin.texts');
    Route::patch('/texts/{text}/toggle-publish', [TextController::class, 'togglePublish'])->name('admin.texts.toggle-publish');
    
    // Rutas de productos
    // Ruta de debug para textos
    Route::get('/texts/create-debug', function () {
        return Inertia::render('admin/texts/CreateDebug');
    })->name('admin.texts.create-debug');
    
    // Rutas de categorías
    Route::put('/categories/reorder', [CategoryController::class, 'reorder'])->name('categories.reorder');
    Route::patch('/categories/{category}/toggle-publish', [CategoryController::class, 'togglePublish'])->name('categories.toggle-publish');
    Route::resource('/categories', CategoryController::class)->names('categories');
    // Sucategorias
    Route::put('/subcategories/reorder', [SubcategoryController::class, 'reorder'])->name('subcategories.reorder');
    Route::patch('/subcategories/{subcategory}/toggle-publish', [SubcategoryController::class, 'togglePublish'])->name('subcategories.toggle-publish');
    Route::resource('/subcategories', SubcategoryController::class)->names('subcategories');
    // productos
    Route::put('/products/reorder', [ProductController::class, 'reorder'])->name('products.reorder');
    Route::patch('/products/{product}/toggle-publish', [ProductController::class, 'togglePublish'])->name('products.toggle-publish');
    Route::resource('/products', ProductController::class)->names('products');    
    // banners
    Route::put('/banners/reorder', [BannerController::class, 'reorder'])->name('banners.reorder');
    Route::patch('/banners/{banner}/toggle-publish', [BannerController::class, 'togglePublish'])->name('banners.toggle-publish');
    Route::resource('/banners', BannerController::class)->names('banners');
    // brands
    Route::put('/brands/reorder', [BrandController::class, 'reorder'])->name('brands.reorder');
    Route::patch('/brands/{brand}/toggle-publish', [BrandController::class, 'togglePublish'])->name('brands.toggle-publish');
    Route::resource('/brands', BrandController::class)->names('brands');
    // images
    Route::put('/images/reorder', [ImageController::class, 'reorder'])->name('images.reorder');
    Route::post('/images/{product}', [ImageController::class, 'store'])->name('images.store');
    Route::resource('/images', ImageController::class)->names('images')->except(['store']);
    // inventories
    Route::resource('/inventories', InventoryController::class)->names('inventories');
    Route::post('/inventories/store_product', [InventoryController::class, 'store_product'])->name('inventories.store_product');
    Route::post('/inventories/destroy_product', [InventoryController::class, 'destroy_product'])->name('inventories.destroy_product');
    


});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
