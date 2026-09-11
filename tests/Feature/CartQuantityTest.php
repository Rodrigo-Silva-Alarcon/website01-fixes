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
        $this->withSession(['shop' => 'my-cart'])->from('/Productos')
            ->patch('/Shop/123', ['amount' => $amount, 'unit_price' => 1, 'sub_total' => 1])
            ->assertRedirect('/Productos');
        expect($this->item->fresh()->amount)->toBe($amount);
        expect($this->item->fresh()->sub_total)->toBe(number_format(12.35 * $amount, 2, '.', ''));
        $this->get('/Productos')->assertInertia(fn (Assert $page) => $page->where('cart.cart_items.0.amount', $amount));
    }
});

it('rejects invalid quantities without changing the cart', function ($amount) {
    $this->withSession(['shop' => 'my-cart'])->patch('/Shop/123', ['amount' => $amount])
        ->assertSessionHasErrors('amount');
    expect($this->item->fresh()->amount)->toBe(1);
})->with([0, -1, 1.5, 10000, 'invalid', null]);

it('does not update another sessions cart', function () {
    $this->patch('/Shop/123', ['amount' => 2])->assertNotFound();
    $this->withSession(['shop' => 'other-cart'])->patch('/Shop/123', ['amount' => 2])->assertNotFound();
    expect($this->item->fresh()->amount)->toBe(1);
});
