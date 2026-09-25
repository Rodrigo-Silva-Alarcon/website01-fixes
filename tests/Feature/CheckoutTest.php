<?php

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->cart = Cart::create(['cart_session' => 'checkout-cart']);
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

it('renders checkout when the session cart has items', function () {
    $this->withSession(['shop' => 'checkout-cart'])
        ->get('/checkout')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('web/CheckoutPage'));
});

it('redirects home when the cart is empty', function () {
    $this->get('/checkout')->assertRedirect('/');
});

it('validates required checkout fields', function () {
    $this->withSession(['shop' => 'checkout-cart'])
        ->post('/checkout', [])
        ->assertSessionHasErrors(['customer_name', 'customer_phone', 'payment_method']);
    expect(Order::count())->toBe(0);
});

it('creates an order, items, payment and clears the cart', function () {
    $this->withSession(['shop' => 'checkout-cart'])
        ->post('/checkout', [
            'customer_name' => 'Ana Perez',
            'customer_phone' => '70000000',
            'customer_email' => 'ana@example.com',
            'customer_address' => 'Av. Siempre Viva 742',
            'notes' => 'Urgente',
            'payment_method' => 'transfer',
        ])
        ->assertRedirect();

    $order = Order::first();
    expect($order)->not->toBeNull();
    expect($order->customer_name)->toBe('Ana Perez');
    expect((float) $order->total)->toBe(200.0);
    expect($order->status)->toBe('pending');
    expect($order->payment_method)->toBe('transfer');

    $orderItem = OrderItem::first();
    expect($orderItem->order_id)->toBe($order->id);
    expect($orderItem->quantity)->toBe(2);
    expect((float) $orderItem->unit_price)->toBe(100.0);

    $payment = Payment::first();
    expect($payment->order_id)->toBe($order->id);
    expect($payment->tipe_pay)->toBe('transfer');
    expect((float) $payment->amount)->toBe(200.0);

    expect(Cart::count())->toBe(0);
    expect(CartItem::count())->toBe(0);
});

it('shows the success page for a created order', function () {
    $order = Order::create([
        'card_id' => $this->cart->id,
        'user_id' => 0,
        'total' => '200.00',
        'customer_name' => 'Ana Perez',
        'customer_phone' => '70000000',
        'status' => 'pending',
        'payment_method' => 'cash',
    ]);

    $this->get('/checkout/exito/'.$order->id)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('web/CheckoutSuccessPage'));
});

it('decrements inventory stock when the order is created', function () {
    $category = Category::create(['name' => 'Stock Cat', 'active' => true]);
    $product = Product::create([
        'name' => 'Stock Product',
        'category_id' => $category->id,
        'active' => true,
    ]);
    Inventory::create([
        'product_id' => $product->id,
        'amount' => 100,
        'stock' => 5,
        'money' => 'BOB',
    ]);
    $cart = Cart::create(['cart_session' => 'stock-cart']);
    CartItem::create([
        'cart_id' => $cart->id,
        'product_id' => $product->id,
        'name' => 'Stock Product',
        'unit_price' => '10.00',
        'amount' => 2,
        'sub_total' => '20.00',
        'money' => 'BOB',
    ]);

    $this->withSession(['shop' => 'stock-cart'])
        ->post('/checkout', [
            'customer_name' => 'Ana Perez',
            'customer_phone' => '70000000',
            'customer_address' => 'Av. Siempre Viva 742',
            'payment_method' => 'cash',
        ])
        ->assertRedirect();

    expect($product->inventory->fresh()->stock)->toBe(3);
});

it('rejects checkout when stock is insufficient', function () {
    $category = Category::create(['name' => 'Low Stock Cat', 'active' => true]);
    $product = Product::create([
        'name' => 'Low Stock Product',
        'category_id' => $category->id,
        'active' => true,
    ]);
    Inventory::create([
        'product_id' => $product->id,
        'amount' => 100,
        'stock' => 1,
        'money' => 'BOB',
    ]);
    $cart = Cart::create(['cart_session' => 'low-stock-cart']);
    CartItem::create([
        'cart_id' => $cart->id,
        'product_id' => $product->id,
        'name' => 'Low Stock Product',
        'unit_price' => '10.00',
        'amount' => 3,
        'sub_total' => '30.00',
        'money' => 'BOB',
    ]);

    $this->withSession(['shop' => 'low-stock-cart'])
        ->from('/checkout')
        ->post('/checkout', [
            'customer_name' => 'Ana Perez',
            'customer_phone' => '70000000',
            'customer_address' => 'Av. Siempre Viva 742',
            'payment_method' => 'cash',
        ])
        ->assertRedirect('/checkout')
        ->assertSessionHas('status');

    expect(Order::count())->toBe(0);
    expect($product->inventory->fresh()->stock)->toBe(1);
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

it('rejects an invalid phone format', function () {
    $this->withSession(['shop' => 'checkout-cart'])
        ->post('/checkout', [
            'customer_name' => 'Ana Perez',
            'customer_phone' => 'abc',
            'customer_address' => 'Av. Siempre Viva 742',
            'payment_method' => 'transfer',
        ])
        ->assertSessionHasErrors('customer_phone');

    expect(Order::count())->toBe(0);
});

it('requires customer address unless payment method is whatsapp', function () {
    $this->withSession(['shop' => 'checkout-cart'])
        ->post('/checkout', [
            'customer_name' => 'Ana Perez',
            'customer_phone' => '70000000',
            'payment_method' => 'cash',
        ])
        ->assertSessionHasErrors('customer_address');

    expect(Order::count())->toBe(0);
});

it('creates an order without address when payment method is whatsapp', function () {
    $this->withSession(['shop' => 'checkout-cart'])
        ->post('/checkout', [
            'customer_name' => 'Ana Perez',
            'customer_phone' => '70000000',
            'payment_method' => 'whatsapp',
        ])
        ->assertRedirect();

    expect(Order::count())->toBe(1);
});

it('updates quantities from the checkout summary through the shop route', function () {
    $this->withSession(['shop' => 'checkout-cart'])
        ->from('/checkout')
        ->patch('/shop/42', ['amount' => 3])
        ->assertRedirect('/checkout');

    expect(CartItem::first()->amount)->toBe(3);
});

it('shows ordered items on the success page', function () {
    $order = Order::create([
        'card_id' => $this->cart->id,
        'user_id' => 0,
        'total' => '200.00',
        'customer_name' => 'Ana Perez',
        'customer_phone' => '70000000',
        'customer_address' => 'Av. Siempre Viva 742',
        'status' => 'pending',
        'payment_method' => 'transfer',
    ]);
    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => null,
        'name' => 'Refrigeradora Samsung 400L',
        'image' => null,
        'amount' => '200.00',
        'quantity' => 2,
        'unit_price' => '100.00',
    ]);

    $this->get('/checkout/exito/'.$order->id)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('web/CheckoutSuccessPage')
            ->where('order.order_items.0.name', 'Refrigeradora Samsung 400L')
            ->where('order.order_items.0.quantity', 2));
});
