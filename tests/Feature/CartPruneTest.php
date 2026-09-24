<?php

use App\Models\Cart;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('prunes abandoned carts older than the cutoff without orders', function () {
    $old = Cart::create(['cart_session' => 'old-abandoned']);
    Cart::where('id', $old->id)->update(['created_at' => now()->subDays(40), 'updated_at' => now()->subDays(40)]);

    $recent = Cart::create(['cart_session' => 'recent-cart']);
    $withOrder = Cart::create(['cart_session' => 'ordered-cart']);
    Order::create([
        'card_id' => $withOrder->id,
        'user_id' => 0,
        'total' => '10.00',
        'customer_name' => 'Ana',
        'customer_phone' => '70000000',
        'status' => 'pending',
        'payment_method' => 'cash',
    ]);
    Cart::where('id', $withOrder->id)->update(['updated_at' => now()->subDays(40)]);

    $this->artisan('carts:prune', ['--days' => 30])->assertSuccessful();

    expect(Cart::where('id', $old->id)->exists())->toBeFalse();
    expect(Cart::where('id', $recent->id)->exists())->toBeTrue();
    expect(Cart::where('id', $withOrder->id)->exists())->toBeTrue();
});