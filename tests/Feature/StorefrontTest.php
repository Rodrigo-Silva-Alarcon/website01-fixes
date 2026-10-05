<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Subcategory;
use App\Mail\MessageReceived;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

it('renders public pages with existing components', function (string $url, string $component) {
    $this->get($url)->assertOk()->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    ['/', 'web/HomePage'], ['/nosotros', 'web/AboutPage'],
    ['/productos', 'web/ProductosPage'], ['/contactanos', 'web/ContactoPage'],
    ['/carrito', 'web/CarritoPage'],
    ['/find?find=camera', 'web/ProductosPage'],
]);

it('directs service enquiries to contact', function () {
    $this->get('/servicios')->assertRedirect('/contactanos');
    $this->get('/Servicios')->assertRedirect('/contactanos');
});

it('redirects legacy capitalized and contact URLs to lowercase', function () {
    $this->get('/Contacto')->assertRedirect('/contactanos');
    $this->get('/contacto')->assertRedirect('/contactanos');
    $this->get('/Contactanos')->assertRedirect('/contactanos');
    $this->get('/Nosotros')->assertRedirect('/nosotros');
    $this->get('/Productos')->assertRedirect('/productos');
});

it('returns not found for missing products and cart items', function () {
    $this->get('/productos/missing/All/missing')->assertNotFound();
    $this->post('/addshop/99999')->assertNotFound();
    $this->post('/removeshop/99999')->assertRedirect();
});

it('filters products by subcategory and multiple brands', function () {
    $category = Category::create(['name' => 'Cameras', 'active' => true]);
    $sub = Subcategory::create(['name' => 'Outdoor', 'category_id' => $category->id, 'active' => true]);
    foreach ([1, 2, 3] as $brand) {
        Product::create(['name' => 'Camera '.$brand, 'category_id' => $category->id, 'subcategory_id' => $sub->id, 'brand_id' => $brand, 'active' => true]);
    }
    Product::create(['name' => 'Indoor', 'category_id' => $category->id, 'active' => true]);
    $this->get('/productos/'.$category->slug.'/'.$sub->slug)->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 3));
    $this->get('/productos?ms[]=1&ms[]=2')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 2));
});

it('validates contact and sends a message', function () {
    Mail::fake();
    $this->post('/enviar', [])->assertSessionHasErrors(['name', 'email', 'phone']);
    Mail::assertNothingSent();
    $this->post('/enviar', ['name' => 'Test', 'email' => 'test@example.com', 'phone' => '12345678'])
        ->assertRedirect('/contactanos')->assertSessionHas('status');
    Mail::assertSent(MessageReceived::class, function ($mail) {
        expect($mail->render())->toContain('Test');
        return true;
    });
});

it('matches product reorder before the resource update route', function () {
    $route = app('router')->getRoutes()->match(Illuminate\Http\Request::create('/admin/products/reorder', 'PUT'));
    expect($route->getActionMethod())->toBe('reorder');
});

it('keeps unpublished products out of category listings', function () {
    $category = Category::create(['name' => 'Cameras', 'active' => true]);
    Product::create(['name' => 'Draft camera', 'category_id' => $category->id, 'active' => false]);
    App\Models\HomeSection::create(['type' => 'products', 'title' => 'Cameras', 'position' => 99, 'settings' => ['source' => 'category', 'category_id' => $category->id]]);
    // Sin productos publicados la sección de la categoría no se envía
    $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('sections', fn ($sections) => collect($sections)->where('title', 'Cameras')->isEmpty()));
});

it('includes inventory price data for product listing cards', function () {
    $category = Category::create(['name' => 'Cameras', 'active' => true]);
    $product = Product::create(['name' => 'Camera One', 'category_id' => $category->id, 'active' => true]);
    App\Models\Inventory::create([
        'product_id' => $product->id,
        'amount' => 150,
        'offer_amount' => 210,
        'stock' => 3,
        'money' => 'Bs.',
    ]);

    $this->get('/productos')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('products.data.0.inventory.amount', '150.00')
        ->where('products.data.0.inventory.money', 'Bs.'));
});

it('returns null image_url when product image file is missing', function () {
    $category = Category::create(['name' => 'Cameras', 'active' => true]);
    $product = Product::create([
        'name' => 'Broken photo',
        'category_id' => $category->id,
        'active' => true,
        'image' => 'data/products/does-not-exist.png',
    ]);

    expect($product->image_url)->toBeNull();
    expect($product->image_webp_url)->toBeNull();
});

it('builds category menu links from active category slugs', function () {
    $category = Category::create(['name' => 'Cocina', 'active' => true]);
    Category::create(['name' => 'Draft', 'active' => false]);
    $sub = App\Models\Subcategory::create(['name' => 'Hornos', 'category_id' => $category->id, 'active' => true]);

    $this->get('/productos')->assertOk()->assertInertia(function (Assert $page) use ($category, $sub) {
        $page->has('menu', 1)
            ->where('menu.0.id', $category->slug)
            ->where('menu.0.name', 'Cocina')
            ->where('menu.0.submenu.0.id', $sub->slug);
    });

    $this->get('/productos/'.$category->slug)->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('web/ProductosPage'));
});

it('provides GET pagination links after filtering', function () {
    $category = Category::create(['name' => 'Cameras', 'active' => true]);
    for ($i = 1; $i <= 21; $i++) {
        Product::create(['name' => 'Camera '.$i, 'category_id' => $category->id, 'active' => true]);
    }
    $this->post('/productos/filtrar', ['cs' => [$category->id]])->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('products.next_page_url', route('products').'?cs%5B0%5D=1&page=2'));
    $this->get('/productos?page=2&cs[]='.$category->id)->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 1));
});

it('opens the text editor without debug output', function () {
    seedRbac();
    $text = App\Models\Text::create([
        'name' => 'Editable text', 'date' => '2026-09-08',
        'gender' => 'male', 'type' => ['article'], 'print_view' => 'a4',
    ]);
    $user = App\Models\User::factory()->create();
    $user->assignRole('editor_textos');
    $this->actingAs($user)
        ->get(route('admin.texts.edit', $text))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/texts/Edit')->where('text.id', $text->id));
});

it('strictly enforces category and brand filter intersection', function () {
    $consolas = Category::create(['name' => 'Consolas', 'active' => true]);
    $tv = Category::create(['name' => 'Televisores', 'active' => true]);

    $sony = App\Models\Brand::create(['name' => 'Sony', 'active' => true]);
    $lg = App\Models\Brand::create(['name' => 'LG', 'active' => true]);

    Product::create([
        'name' => 'PlayStation 5',
        'category_id' => $consolas->id,
        'brand_id' => $sony->id,
        'active' => true,
    ]);

    Product::create([
        'name' => 'LG OLED TV',
        'category_id' => $tv->id,
        'brand_id' => $lg->id,
        'active' => true,
    ]);

    // Filtering Consolas + LG must return 0 products, NOT show LG products from other categories
    $this->get('/productos?cs[]='.$consolas->id.'&ms[]='.$lg->id)->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('products.data', 0)
            ->where('cates', [$consolas->id])
            ->where('marcas', [$lg->id])
        );

    // Filtering Consolas + Sony returns PlayStation 5
    $this->get('/productos?cs[]='.$consolas->id.'&ms[]='.$sony->id)->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.name', 'PlayStation 5')
        );
});

it('does not match search queries on raw description HTML specs', function () {
    $celulares = Category::create(['name' => 'Celulares', 'active' => true]);
    $samsung = App\Models\Brand::create(['name' => 'Samsung', 'active' => true]);

    Product::create([
        'name' => 'Samsung Galaxy A25',
        'summary' => 'Smartphone gama media 128GB',
        'description' => '<p>Incluye patas antideslizantes para soporte</p>',
        'category_id' => $celulares->id,
        'brand_id' => $samsung->id,
        'active' => true,
    ]);

    // Searching 'pata' should not return A25
    $this->get('/productos?find=pata')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 0));

    // Searching 'A25' or 'Samsung' finds the product
    $this->get('/productos?find=A25')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 1));

    $this->get('/productos?find=Samsung')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 1));
});

it('passes activeSubcategory to ProductosPage when viewing empty subcategory', function () {
    $electro = Category::create(['name' => 'Electrodomésticos', 'active' => true]);
    $estufas = Subcategory::create(['name' => 'Estufas', 'category_id' => $electro->id, 'active' => true]);

    $this->get('/productos/'.$electro->slug.'/'.$estufas->slug)->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('web/ProductosPage')
            ->has('products.data', 0)
            ->where('activeSubcategory.name', 'Estufas')
            ->where('activeCategory.name', 'Electrodomésticos')
        );
});

it('combines category and subcategory filters, offers and price sorting in the listing', function () {
    $tv = Category::create(['name' => 'Televisores', 'active' => true]);
    $kitchen = Category::create(['name' => 'Cocina', 'active' => true]);
    $oven = Subcategory::create(['name' => 'Hornos', 'category_id' => $kitchen->id, 'active' => true]);
    $fridge = Subcategory::create(['name' => 'Refrigeradores', 'category_id' => $kitchen->id, 'active' => true]);

    $make = function (string $name, int $cat, ?int $sub, float $amount, ?float $offer = null) {
        $p = Product::create(['name' => $name, 'category_id' => $cat, 'subcategory_id' => $sub, 'active' => true]);
        App\Models\Inventory::create([
            'product_id' => $p->id, 'amount' => $amount, 'offer_amount' => $offer, 'stock' => 1, 'money' => 'Bs.',
            'ini' => $offer ? now()->subDay()->toDateString() : null, 'fin' => $offer ? now()->addDay()->toDateString() : null,
        ]);
    };
    $make('TV Grande', $tv->id, null, 5000, 4000);
    $make('Horno', $kitchen->id, $oven->id, 3000);
    $make('Refri', $kitchen->id, $fridge->id, 9000, 6000);

    // categoría completa + una subcategoría de otra suman resultados
    $this->get('/productos?cs[]='.$tv->id.'&ss[]='.$oven->id)->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 2)
            ->where('subs', [$oven->id])
            ->where('categories.0.subcategories.0.products_count', 1));

    $this->get('/productos?offers=1&sort=asc')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 2)
            ->where('products.data.0.name', 'TV Grande')
            ->where('products.data.1.name', 'Refri'));

    $this->get('/productos?sort=desc')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('products.data.0.name', 'Refri')->where('sort', 'desc'));

    // mayor descuento: Refri (-33%) antes que TV (-20%)
    $this->get('/productos?sort=off')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('products.data.0.name', 'Refri')->where('products.data.1.name', 'TV Grande'));
});

it('shares at least five in-stock cart suggestions, popular first and without cart items', function () {
    $category = Category::create(['name' => 'Audio', 'active' => true]);
    $ids = [];
    foreach (range(1, 7) as $i) {
        $p = Product::create(['name' => 'Parlante '.$i, 'category_id' => $category->id, 'active' => true]);
        $p->forceFill(['pop' => $i === 7])->save();
        App\Models\Inventory::create(['product_id' => $p->id, 'amount' => 100, 'stock' => $i === 6 ? 0 : 3, 'money' => 'Bs.']);
        $ids[$i] = $p->id;
    }

    $this->post('/addshop/'.$ids[1]);

    $this->get('/productos')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('cartSuggestions', 5)
        ->where('cartSuggestions.0.id', $ids[7])
        ->where('cartSuggestions', fn ($s) => !collect($s)->pluck('id')->intersect([$ids[1], $ids[6]])->count()));
});

it('sends the product gallery images in their configured order to the detail page', function () {
    $category = Category::create(['name' => 'Consolas', 'active' => true]);
    $product = Product::create(['name' => 'Consola Demo', 'category_id' => $category->id, 'active' => true]);
    $product->images()->create(['name' => 'b.jpg', 'original_name' => 'b.jpg', 'order' => 2]);
    $product->images()->create(['name' => 'a.jpg', 'original_name' => 'a.jpg', 'order' => 1]);

    $this->get(route('product', ['category' => $category->slug, 'subcategory' => 'All', 'product' => $product->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('web/ProductDetailPage')
            ->has('product.images', 2)
            ->where('product.images.0.image_url', asset('data/images/a.jpg'))
            ->where('product.images.1.image_url', asset('data/images/b.jpg')));
});
