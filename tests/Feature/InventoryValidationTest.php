<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('rejects offers above the normal price and offer windows that end before they start', function () {
    seedRbac();
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $product = Product::create(['name' => 'Tele', 'category_id' => Category::create(['name' => 'TV', 'active' => true])->id, 'active' => true]);
    $base = ['product_id' => $product->id, 'amount' => 100, 'stock' => 5, 'money' => 'Bs.'];

    $this->actingAs($admin);
    $this->post(route('inventories.store'), [...$base, 'offer_amount' => 150])->assertSessionHasErrors('offer_amount');
    $this->post(route('inventories.store'), [...$base, 'offer_amount' => 80, 'ini' => '2026-10-10', 'fin' => '2026-10-01'])->assertSessionHasErrors('fin');
    $this->post(route('inventories.store'), [...$base, 'offer_amount' => 80, 'fin' => '2026-10-01'])->assertSessionHasNoErrors();
});
