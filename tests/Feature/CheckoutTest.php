<?php

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
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
