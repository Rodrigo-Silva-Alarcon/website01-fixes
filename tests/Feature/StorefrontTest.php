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
    ['/', 'web/HomePage'], ['/Nosotros', 'web/AboutPage'],
    ['/Productos', 'web/ProductosPage'], ['/Contactanos', 'web/ContactoPage'],
    ['/Find?find=camera', 'web/ProductosPage'],
]);

it('directs service enquiries to contact', function () {
    $this->get('/Servicios')->assertRedirect('/Contactanos');
});

it('returns not found for missing products and cart items', function () {
    $this->get('/Productos/missing/All/missing')->assertNotFound();
    $this->get('/AddShop/99999')->assertNotFound();
});

it('filters products by subcategory and multiple brands', function () {
    $category = Category::create(['name' => 'Cameras', 'active' => true]);
    $sub = Subcategory::create(['name' => 'Outdoor', 'category_id' => $category->id, 'active' => true]);
    foreach ([1, 2, 3] as $brand) {
        Product::create(['name' => 'Camera '.$brand, 'category_id' => $category->id, 'subcategory_id' => $sub->id, 'brand_id' => $brand, 'active' => true]);
    }
    Product::create(['name' => 'Indoor', 'category_id' => $category->id, 'active' => true]);
    $this->get('/Productos/'.$category->slug.'/'.$sub->slug)->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 3));
    $this->get('/Productos?ms[]=1&ms[]=2')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('products.data', 2));
});

it('validates contact and sends a message', function () {
    Mail::fake();
    $this->post('/Enviar', [])->assertSessionHasErrors(['name', 'email', 'phone']);
    Mail::assertNothingSent();
    $this->post('/Enviar', ['name' => 'Test', 'email' => 'test@example.com', 'phone' => '12345678'])
        ->assertRedirect('/Contactanos')->assertSessionHas('status');
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

it('provides GET pagination links after filtering', function () {
    $category = Category::create(['name' => 'Cameras', 'active' => true]);
    for ($i = 1; $i <= 21; $i++) {
        Product::create(['name' => 'Camera '.$i, 'category_id' => $category->id, 'active' => true]);
    }
    $this->post('/Productos/Filtrar', ['cs' => [$category->id]])->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('products.next_page_url', route('products').'?page=2'));
    $this->get('/Productos?page=2&cs[]='.$category->id)->assertOk()
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
