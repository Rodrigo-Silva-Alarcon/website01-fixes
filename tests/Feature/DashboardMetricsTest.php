<?php

use App\Models\Cart;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('shows dashboard metrics for admins', function () {
    seedRbac();
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $user = User::factory()->create();
    $cart = Cart::create(['user_id' => $user->id, 'cart_session' => 42]);
    Order::create(['card_id' => $cart->id, 'user_id' => $user->id, 'total' => 100]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
            ->has('products')
            ->has('categories')
            ->has('lowStock')
            ->has('recentOrders')
            ->has('revenueMonth')
            ->has('ordersMonth')
            ->where('ordersMonth', 1)
            ->where('revenueMonth', 100)
        );
});

it('lists low stock inventories on dashboard', function () {
    seedRbac();
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
            ->where('lowStock', [])
        );
});
