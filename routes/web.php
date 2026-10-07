<?php

use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\TextController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\SubcategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\AboutController;
use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Admin\FooterController;
use App\Http\Controllers\Admin\StoreTextController;
use App\Http\Controllers\Admin\HomeSectionController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\ImageController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\BackupController;
use App\Http\Controllers\Admin\CartController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\WebController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\CheckoutController;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [WebController::class, 'homepage'])->name('home');
Route::get('/sitemap.xml', \App\Http\Controllers\SitemapController::class)->name('sitemap');
Route::get('/nosotros', [WebController::class, 'about'])->name('about');
Route::get('/productos', [WebController::class, 'products'])->name('products');
Route::post('/productos/filtrar', [WebController::class, 'products'])->name('products_post');
Route::get('/marcas/{brand}', [WebController::class, 'products'])->name('brand');
Route::get('/productos/{category}', [WebController::class, 'products'])->name('category');
Route::get('/productos/{category}/{subcategory}', [WebController::class, 'products'])->name('subcategory');
Route::get('/productos/{category}/{subcategory}/{product}', [WebController::class, 'product'])->name('product');
Route::get('/servicios', [WebController::class, 'services'])->name('services');
Route::get('/contactanos', [WebController::class, 'contact'])->name('contact');
Route::redirect('/Contacto', '/contactanos', 301);
Route::redirect('/contacto', '/contactanos', 301);
Route::redirect('/Nosotros', '/nosotros', 301);
Route::redirect('/Productos', '/productos', 301);
Route::redirect('/Marcas', '/marcas', 301);
Route::redirect('/Servicios', '/contactanos', 301);
Route::redirect('/Contactanos', '/contactanos', 301);
Route::redirect('/Find', '/find', 301);
Route::post('/enviar', [WebController::class, 'store'])->middleware('throttle:5,1')->name('store');
Route::get('/find', [WebController::class, 'storefind'])->name('storefind');

Route::get('/carrito', [WebController::class, 'cart'])->name('cart');
Route::post('/addshop/{product}', [ShopController::class, 'add'])->name('addshop');
Route::patch('/shop/{product}', [ShopController::class, 'update'])->name('updateshop');
Route::post('/removeshop/{product}', [ShopController::class, 'remove'])->name('removeshop');
Route::post('/clearshop', [ShopController::class, 'clear'])->name('clearshop');

Route::get('/checkout', [CheckoutController::class, 'show'])->name('checkout');
Route::post('/checkout', [CheckoutController::class, 'store'])->middleware('throttle:checkout')->name('checkout.store');
Route::get('/checkout/exito/{order}', [CheckoutController::class, 'success'])->name('checkout.success');

// Rutas del panel de administración con prefijo admin/
Route::prefix('admin')->middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'dashboard'])
        ->middleware('permission:access_dashboard')
        ->name('admin.dashboard');

    // Rutas de usuarios (§5.1.1). Ver da acceso al listado; crear, editar y borrar
    // necesitan su propio permiso también en el servidor (no solo en la interfaz).
    Route::middleware('permission:view_users')->group(function () {
        Route::resource('/users', UserController::class)->except('show')->names('admin.users')
        ->middlewareFor(['create', 'store'], 'permission:create_users')
        ->middlewareFor(['edit', 'update'], 'permission:edit_users')
        ->middlewareFor('destroy', 'permission:delete_users');
        Route::get('/users/{user}', [UserController::class, 'show'])->name('admin.users.show');
        Route::middleware('permission:edit_users')->group(function () {
            Route::get('/users/{user}/password', [UserController::class, 'editPassword'])->name('admin.users.password.edit');
            Route::put('/users/{user}/password', [UserController::class, 'updatePassword'])->name('admin.users.password.update');
        });
    });

    // Rutas de roles (solo para administradores)
    Route::middleware('role:admin')->group(function () {
        Route::resource('/roles', RoleController::class)->names('admin.roles');
    });

    // Rutas de permisos (solo para administradores)
    Route::middleware('role:admin')->group(function () {
        Route::resource('/permissions', PermissionController::class)->names('admin.permissions');
    });

    // Rutas de textos (§5.1.1)
    Route::middleware('permission:view_texts')->group(function () {
        Route::resource('/texts', TextController::class)->names('admin.texts')
        ->middlewareFor(['create', 'store'], 'permission:create_texts')
        ->middlewareFor(['edit', 'update'], 'permission:edit_texts')
        ->middlewareFor('destroy', 'permission:delete_texts');
        Route::patch('/texts/{text}/toggle-publish', [TextController::class, 'togglePublish'])->middleware('permission:publish_texts')->name('admin.texts.toggle-publish');
    });
    
    // Categorías (§4.8.8 RBAC)
    Route::middleware('permission:view_categories')->group(function () {
        Route::put('/categories/reorder', [CategoryController::class, 'reorder'])->middleware('permission:edit_categories')->name('categories.reorder');
        Route::patch('/categories/{category}/toggle-publish', [CategoryController::class, 'togglePublish'])->middleware('permission:edit_categories')->name('categories.toggle-publish');
        Route::resource('/categories', CategoryController::class)->names('categories')
        ->middlewareFor(['create', 'store'], 'permission:create_categories')
        ->middlewareFor(['edit', 'update'], 'permission:edit_categories')
        ->middlewareFor('destroy', 'permission:delete_categories');
    });
    // Subcategorías
    Route::middleware('permission:view_subcategories')->group(function () {
        Route::put('/subcategories/reorder', [SubcategoryController::class, 'reorder'])->middleware('permission:edit_subcategories')->name('subcategories.reorder');
        Route::patch('/subcategories/{subcategory}/toggle-publish', [SubcategoryController::class, 'togglePublish'])->middleware('permission:edit_subcategories')->name('subcategories.toggle-publish');
        Route::resource('/subcategories', SubcategoryController::class)->names('subcategories')
        ->middlewareFor(['create', 'store'], 'permission:create_subcategories')
        ->middlewareFor(['edit', 'update'], 'permission:edit_subcategories')
        ->middlewareFor('destroy', 'permission:delete_subcategories');
    });
    // Productos
    Route::middleware('permission:view_products')->group(function () {
        Route::put('/products/reorder', [ProductController::class, 'reorder'])->middleware('permission:edit_products')->name('products.reorder');
        Route::patch('/products/{product}/toggle-publish', [ProductController::class, 'togglePublish'])->middleware('permission:edit_products')->name('products.toggle-publish');
        Route::resource('/products', ProductController::class)->names('products')
        ->middlewareFor(['create', 'store'], 'permission:create_products')
        ->middlewareFor(['edit', 'update'], 'permission:edit_products')
        ->middlewareFor('destroy', 'permission:delete_products');
    });
    // Banners
    Route::middleware('permission:view_banners')->group(function () {
        Route::put('/banners/reorder', [BannerController::class, 'reorder'])->middleware('permission:edit_banners')->name('banners.reorder');
        Route::patch('/banners/{banner}/toggle-publish', [BannerController::class, 'togglePublish'])->middleware('permission:edit_banners')->name('banners.toggle-publish');
        Route::resource('/banners', BannerController::class)->names('banners')
        ->middlewareFor(['create', 'store'], 'permission:create_banners')
        ->middlewareFor(['edit', 'update'], 'permission:edit_banners')
        ->middlewareFor('destroy', 'permission:delete_banners');
    });
    // Nosotros: textos, galería e historial de cambios
    Route::middleware('permission:view_about')->group(function () {
        Route::get('/about', [AboutController::class, 'index'])->name('admin.about.index');
        Route::middleware('permission:edit_about')->group(function () {
            Route::put('/about/texts', [AboutController::class, 'updateTexts'])->name('admin.about.texts');
            Route::put('/about/images/reorder', [AboutController::class, 'reorder'])->name('admin.about.images.reorder');
            Route::post('/about/images/gallery', [AboutController::class, 'saveGallery'])->name('admin.about.images.gallery');
            Route::post('/about/images/{image}', [AboutController::class, 'replaceImage'])->name('admin.about.images.replace');
            Route::patch('/about/images/{image}', [AboutController::class, 'updateImage'])->name('admin.about.images.update');
        });
    });
    // Contacto: datos, horario de atención y textos de Contáctanos (fuente única para toda la web)
    Route::middleware('permission:view_contact')->group(function () {
        Route::get('/contact', [ContactController::class, 'index'])->name('admin.contact.index');
        Route::middleware('permission:edit_contact')->group(function () {
            Route::put('/contact/data', [ContactController::class, 'updateData'])->name('admin.contact.data');
            Route::put('/contact/schedule', [ContactController::class, 'updateSchedule'])->name('admin.contact.schedule');
            Route::put('/contact/texts', [ContactController::class, 'updateTexts'])->name('admin.contact.texts');
        });
    });
    // Footer: logo (modo claro / oscuro o uno transparente) y textos del pie de página
    Route::middleware('permission:view_footer')->group(function () {
        Route::get('/footer', [FooterController::class, 'index'])->name('admin.footer.index');
        Route::post('/footer', [FooterController::class, 'update'])->middleware('permission:edit_footer')->name('admin.footer.update');
    });
    // Textos de la tienda: carrito, ficha de producto y mensajes de WhatsApp
    Route::middleware('permission:view_store_texts')->group(function () {
        Route::get('/store-texts', [StoreTextController::class, 'index'])->name('admin.store-texts.index');
        Route::put('/store-texts', [StoreTextController::class, 'update'])->middleware('permission:edit_store_texts')->name('admin.store-texts.update');
    });
    // Página de inicio: secciones (orden, visibilidad, contenido)
    Route::middleware('permission:view_home')->group(function () {
        Route::get('/home-sections', [HomeSectionController::class, 'index'])->name('admin.home.index');
        Route::get('/home-sections/products', [HomeSectionController::class, 'products'])->name('admin.home.products');
        Route::post('/home-sections', [HomeSectionController::class, 'store'])->middleware('permission:create_home')->name('admin.home.store');
        Route::middleware('permission:edit_home')->group(function () {
            Route::put('/home-sections/reorder', [HomeSectionController::class, 'reorder'])->name('admin.home.reorder');
            Route::put('/home-sections/{section}', [HomeSectionController::class, 'update'])->name('admin.home.update');
            Route::patch('/home-sections/{section}/toggle', [HomeSectionController::class, 'toggle'])->name('admin.home.toggle');
            Route::post('/home-sections/categories/{category}/image', [HomeSectionController::class, 'categoryImage'])->name('admin.home.category-image');
            Route::delete('/home-sections/categories/{category}/image', [HomeSectionController::class, 'destroyCategoryImage'])->name('admin.home.category-image.destroy');
        });
        Route::delete('/home-sections/{section}', [HomeSectionController::class, 'destroy'])->middleware('permission:delete_home')->name('admin.home.destroy');
    });
    // Marcas
    Route::middleware('permission:view_brands')->group(function () {
        Route::put('/brands/reorder', [BrandController::class, 'reorder'])->middleware('permission:edit_brands')->name('brands.reorder');
        Route::patch('/brands/{brand}/toggle-publish', [BrandController::class, 'togglePublish'])->middleware('permission:edit_brands')->name('brands.toggle-publish');
        Route::resource('/brands', BrandController::class)->names('brands')
        ->middlewareFor(['create', 'store'], 'permission:create_brands')
        ->middlewareFor(['edit', 'update'], 'permission:edit_brands')
        ->middlewareFor('destroy', 'permission:delete_brands');
    });
    // Imágenes de producto (§5.1.1 — requiere view_products)
    Route::middleware('permission:view_products')->group(function () {
        // Subir, ordenar o quitar fotos de la galería es editar el producto
        Route::put('/images/reorder', [ImageController::class, 'reorder'])->middleware('permission:edit_products')->name('images.reorder');
        Route::post('/images/{product}', [ImageController::class, 'store'])->middleware('permission:edit_products')->name('images.store');
        Route::resource('/images', ImageController::class)->names('images')->except(['store'])
            ->middlewareFor(['create', 'edit', 'update', 'destroy'], 'permission:edit_products');
    });
    // Inventarios
    Route::middleware('permission:view_inventories')->group(function () {
        Route::resource('/inventories', InventoryController::class)->names('inventories')
        ->middlewareFor(['create', 'store'], 'permission:create_inventories')
        ->middlewareFor(['edit', 'update'], 'permission:edit_inventories')
        ->middlewareFor('destroy', 'permission:delete_inventories');
        Route::post('/inventories/store_product', [InventoryController::class, 'store_product'])->middleware('permission:create_inventories')->name('inventories.store_product');
        Route::post('/inventories/destroy_product', [InventoryController::class, 'destroy_product'])->middleware('permission:delete_inventories')->name('inventories.destroy_product');
    });

    // Carritos (§4.7.17 + §4.8.8)
    Route::middleware('permission:view_carts')->group(function () {
        Route::get('/carts', [CartController::class, 'index'])->name('admin.carts.index');
        Route::delete('/carts/{cart}', [CartController::class, 'destroy'])->name('admin.carts.destroy');
    });

    // Copias de seguridad (solo administradores). Restaurar solo por consola.
    Route::middleware('role:admin')->group(function () {
        Route::get('/backups', [BackupController::class, 'index'])->name('admin.backups.index');
        Route::post('/backups', [BackupController::class, 'store'])->middleware('throttle:6,1')->name('admin.backups.store');
        Route::post('/backups/images', [BackupController::class, 'storeImages'])->middleware('throttle:3,1')->name('admin.backups.images');
        Route::get('/backups/{name}/download', [BackupController::class, 'download'])
            ->where('name', '[A-Za-z0-9._-]+')
            ->name('admin.backups.download');
    });

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
