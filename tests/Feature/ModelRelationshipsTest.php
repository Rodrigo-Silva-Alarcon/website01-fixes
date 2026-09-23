<?php

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Image;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\Product;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('defines brand relationships', function () {
    $brand = new Brand();
    expect($brand->products())->toBeInstanceOf(HasMany::class)
        ->and($brand->inventories())->toBeInstanceOf(HasMany::class);
});

it('defines banner product relationship', function () {
    expect((new Banner())->product())->toBeInstanceOf(BelongsTo::class);
});

it('defines subcategory products relationship', function () {
    expect((new Subcategory())->products())->toBeInstanceOf(HasMany::class);
});

it('defines image morphTo relationship', function () {
    expect((new Image())->imagetable())->toBeInstanceOf(MorphTo::class);
});

it('round-trips cart item belongs-to cart', function () {
    $user = User::factory()->create();
    $cart = Cart::create(['user_id' => $user->id, 'cart_session' => 'test']);
    $cat = Category::create(['name' => 'Cart Cat', 'slug' => 'cart-cat', 'active' => true, 'order' => 1]);
    $product = Product::create([
        'category_id' => $cat->id,
        'name' => 'Cart Product',
        'slug' => 'cart-product',
        'active' => true,
        'order' => 1,
    ]);
    $item = CartItem::create([
        'cart_id' => $cart->id,
        'product_id' => $product->id,
        'name' => 'Test',
        'unit_price' => 10,
        'amount' => 1,
        'money' => 'Bo',
        'sub_total' => 10,
    ]);

    expect($item->cart->id)->toBe($cart->id);
    expect($item->product->id)->toBe($product->id);
    expect($cart->cartItems->pluck('id')->all())->toContain($item->id);
});

it('round-trips category products and subcategory', function () {
    $cat = Category::create([
        'name' => 'Cat Test Rel',
        'slug' => 'cat-test-rel',
        'active' => true,
        'order' => 1,
    ]);
    $sub = Subcategory::create([
        'category_id' => $cat->id,
        'name' => 'Sub Test Rel',
        'slug' => 'sub-test-rel',
        'active' => true,
        'order' => 1,
    ]);
    $product = Product::create([
        'category_id' => $cat->id,
        'subcategory_id' => $sub->id,
        'name' => 'Prod Test Rel',
        'slug' => 'prod-test-rel',
        'active' => true,
        'order' => 1,
    ]);

    expect($cat->products->pluck('id')->all())->toContain($product->id);
    expect($cat->subcategories->pluck('id')->all())->toContain($sub->id);
    expect($sub->products->pluck('id')->all())->toContain($product->id);
    expect($product->category->id)->toBe($cat->id);
    expect($product->subcategory->id)->toBe($sub->id);
    expect($product->inventory)->toBeNull();
});

it('round-trips order items', function () {
    $user = User::factory()->create();
    $cart = Cart::create(['user_id' => $user->id, 'cart_session' => 'sess-order']);
    $order = Order::create([
        'card_id' => $cart->id,
        'user_id' => $user->id,
        'total' => 100,
    ]);
    $item = $order->orderItems()->create([
        'product_id' => null,
        'name' => 'Order line',
        'amount' => 10,
    ]);

    expect($order->orderItems->pluck('id')->all())->toContain($item->id);
    expect($item->order->id)->toBe($order->id);
    expect($cart->orders->pluck('id')->all())->toContain($order->id);
});

it('round-trips inventory belongs-to product', function () {
    $cat = Category::create(['name' => 'Inv Cat', 'slug' => 'inv-cat', 'active' => true, 'order' => 1]);
    $product = Product::create([
        'category_id' => $cat->id,
        'name' => 'Inv Product',
        'slug' => 'inv-product',
        'active' => true,
        'order' => 1,
    ]);
    $inv = Inventory::create([
        'product_id' => $product->id,
        'amount' => 5,
        'stock' => 5,
        'money' => 'Bo',
    ]);

    expect($inv->product->id)->toBe($product->id);
    expect($product->inventory->id)->toBe($inv->id);
});
