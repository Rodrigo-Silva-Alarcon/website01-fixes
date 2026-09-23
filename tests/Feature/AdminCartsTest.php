<?php

use App\Http\Controllers\Admin\CartController;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lists carts for authenticated users at admin.carts.index', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $user = User::factory()->create();
    $cart = Cart::create(['user_id' => $user->id, 'cart_session' => 111]);

    $this->actingAs($admin)
        ->get(route('admin.carts.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/carts/Index')
            ->where('records.total', 1)
            ->where('records.data.0.id', $cart->id)
        );
});

it('shows empty message when there are no carts', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('admin.carts.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/carts/Index')
            ->where('records.total', 0)
        );
});

it('deletes a cart', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $cart = Cart::create(['user_id' => null, 'cart_session' => 999]);

    $this->actingAs($admin)
        ->delete(route('admin.carts.destroy', $cart))
        ->assertRedirect(route('admin.carts.index'));

    expect(Cart::find($cart->id))->toBeNull();
});

it('requires authentication for carts index', function () {
    $this->get(route('admin.carts.index'))->assertRedirect('/login');
});
