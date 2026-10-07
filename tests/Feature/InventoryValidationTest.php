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

it('keeps the admin on the screen they edited stock from', function () {
    seedRbac();
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $product = Product::create(['name' => 'Tele', 'category_id' => Category::create(['name' => 'TV', 'active' => true])->id, 'active' => true]);
    $inventory = \App\Models\Inventory::create(['product_id' => $product->id, 'amount' => 100, 'stock' => 5, 'money' => 'Bs.']);
    $data = ['product_id' => $product->id, 'amount' => 120, 'stock' => 3, 'money' => 'Bs.'];

    $this->actingAs($admin);
    $this->put(route('inventories.update', $inventory), $data)->assertRedirect(route('inventories.index'));
    $this->from(route('products.edit', $product))->put(route('inventories.update_product', $inventory), $data)
        ->assertRedirect(route('products.edit', $product));
    $this->from(route('products.edit', $product))->delete(route('inventories.destroy_product', $inventory))
        ->assertRedirect(route('products.edit', $product));
    expect(\App\Models\Inventory::count())->toBe(0);
});
