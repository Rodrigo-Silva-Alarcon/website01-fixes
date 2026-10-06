<?php

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $cart = Cart::create(['cart_session' => 'my-cart']);
    $this->item = CartItem::create([
        'cart_id' => $cart->id, 'product_id' => 123, 'name' => 'Camera',
        'unit_price' => '12.35', 'amount' => 1, 'sub_total' => '12.35', 'money' => 'BOB',
    ]);
});

it('persists increased and decreased quantities and recalculates the subtotal', function () {
    foreach ([3, 2, 1] as $amount) {
        $this->withSession(['shop' => 'my-cart'])->from('/productos')
            ->patch('/shop/123', ['amount' => $amount, 'unit_price' => 1, 'sub_total' => 1])
            ->assertRedirect('/productos');
        expect($this->item->fresh()->amount)->toBe($amount);
        expect($this->item->fresh()->sub_total)->toBe(number_format(12.35 * $amount, 2, '.', ''));
        $this->get('/productos')->assertInertia(fn (Assert $page) => $page->where('cart.cart_items.0.amount', $amount));
    }
});

it('rejects invalid quantities without changing the cart', function ($amount) {
    $this->withSession(['shop' => 'my-cart'])->patch('/shop/123', ['amount' => $amount])
        ->assertSessionHasErrors('amount');
    expect($this->item->fresh()->amount)->toBe(1);
})->with([0, -1, 1.5, 10000, 'invalid', null]);

it('does not update another sessions cart', function () {
    $this->patch('/shop/123', ['amount' => 2])->assertNotFound();
    $this->withSession(['shop' => 'other-cart'])->patch('/shop/123', ['amount' => 2])->assertNotFound();
    expect($this->item->fresh()->amount)->toBe(1);
});

it('rejects duplicate cart_session values', function () {
    Cart::create(['cart_session' => 'my-cart']);
})->throws(\Illuminate\Database\QueryException::class);

it('reuses one cart when adding products without a prior session', function () {
    $category = \App\Models\Category::create(['name' => 'Race Cat', 'active' => true]);
    $product = \App\Models\Product::create([
        'name' => 'Race Product',
        'category_id' => $category->id,
        'active' => true,
    ]);
    \App\Models\Inventory::create([
        'product_id' => $product->id,
        'amount' => 100,
        'stock' => 10,
        'money' => 'BOB',
    ]);

    $this->post('/addshop/'.$product->id);
    $this->post('/addshop/'.$product->id);

    expect(Cart::where('cart_session', 'my-cart')->count())->toBe(1);
    expect(Cart::count())->toBe(2);
    expect(CartItem::where('product_id', $product->id)->count())->toBe(1);
    expect(CartItem::where('product_id', $product->id)->first()->amount)->toBe(2);
});

it('empties only the current sessions cart', function () {
    $other = Cart::create(['cart_session' => 'other-cart']);
    $otherItem = CartItem::create([
        'cart_id' => $other->id, 'product_id' => 123, 'name' => 'Camera',
        'unit_price' => '12.35', 'amount' => 1, 'sub_total' => '12.35', 'money' => 'BOB',
    ]);

    $this->withSession(['shop' => 'my-cart'])->from('/carrito')
        ->post('/clearshop')
        ->assertRedirect('/carrito');

    expect($this->item->fresh())->toBeNull();
    expect($otherItem->fresh())->not->toBeNull();
});
