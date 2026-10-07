<?php

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->cart = Cart::create(['cart_session' => 'shop-cart']);
    $this->item = CartItem::create([
        'cart_id' => $this->cart->id,
        'product_id' => 42,
        'name' => 'Camera',
        'unit_price' => '100.00',
        'amount' => 2,
        'sub_total' => '200.00',
        'money' => 'BOB',
    ]);
});

it('falls back to amount when offer window is active but offer_amount is null', function () {
    $category = Category::create(['name' => 'Null Offer', 'active' => true]);
    $product = Product::create([
        'name' => 'Null Offer Product',
        'category_id' => $category->id,
        'active' => true,
    ]);
    Inventory::create([
        'product_id' => $product->id,
        'amount' => 99,
        'offer_amount' => null,
        'ini' => now()->subDay()->toDateString(),
        'fin' => now()->addDay()->toDateString(),
        'stock' => 5,
        'money' => 'BOB',
    ]);

    $this->post('/addshop/'.$product->id);

    $item = CartItem::latest('id')->first();
    expect($item)->not->toBeNull();
    expect((float) $item->unit_price)->toBe(99.0);
});

it('charges the offer price on the first and last day of the offer', function () {
    $product = Product::create(['name' => 'Refrigeradora', 'category_id' => Category::create(['name' => 'Línea blanca', 'active' => true])->id, 'active' => true]);
    Inventory::create(['product_id' => $product->id, 'amount' => 3299, 'offer_amount' => 3000, 'ini' => '2026-10-05', 'fin' => '2026-10-07', 'stock' => 5, 'money' => 'Bs.']);

    foreach (['2026-10-05 00:30:00', '2026-10-07 14:51:00', '2026-10-07 23:59:00'] as $moment) {
        $this->travelTo(\Illuminate\Support\Carbon::parse($moment, 'America/La_Paz'));
        $this->post('/addshop/'.$product->id);
        $item = CartItem::where('product_id', $product->id)->latest('id')->first();
        expect((float) $item->unit_price)->toBe(3000.0)
            ->and((float) $item->sub_total)->toBe(3000.0 * $item->amount);
    }

    $this->travelTo(\Illuminate\Support\Carbon::parse('2026-10-08 00:01:00', 'America/La_Paz'));
    $this->post('/addshop/'.$product->id);
    expect((float) CartItem::where('product_id', $product->id)->latest('id')->first()->unit_price)->toBe(3299.0);
});

it('updates quantities from the cart page through the shop route', function () {
    $this->withSession(['shop' => 'shop-cart'])
        ->from('/carrito')
        ->patch('/shop/42', ['amount' => 3])
        ->assertRedirect('/carrito');

    expect(CartItem::first()->amount)->toBe(3);
});
