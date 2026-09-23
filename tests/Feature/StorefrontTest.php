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
    $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page->has('categories.0.products', 0));
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
    $text = App\Models\Text::create([
        'name' => 'Editable text', 'date' => '2026-09-08',
        'gender' => 'male', 'type' => ['article'], 'print_view' => 'a4',
    ]);
    $this->actingAs(App\Models\User::factory()->create())
        ->get(route('admin.texts.edit', $text))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/texts/Edit')->where('text.id', $text->id));
});
