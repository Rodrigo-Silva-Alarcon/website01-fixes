<?php

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function orderProduct(string $name, float $price, int $stock, ?float $offer = null): Product
{
    $category = Category::firstOrCreate(['name' => 'Línea blanca'], ['active' => true]);
    $product = Product::create(['name' => $name, 'category_id' => $category->id, 'active' => true]);
    Inventory::create([
        'product_id' => $product->id,
        'amount' => $price,
        'offer_amount' => $offer,
        'ini' => $offer ? now()->subDay()->toDateString() : null,
        'fin' => $offer ? now()->addDay()->toDateString() : null,
        'stock' => $stock,
        'money' => 'Bs.',
    ]);

    return $product;
}

function cartWith(array $lines, string $session = 'wa-cart'): Cart
{
    $cart = Cart::create(['cart_session' => $session]);
    foreach ($lines as [$product, $qty, $price]) {
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'name' => $product->name,
            'unit_price' => $price,
            'amount' => $qty,
            'sub_total' => $price * $qty,
            'money' => 'Bs.',
        ]);
    }

    return $cart;
}

function ordersAdmin(): User
{
    seedRbac();
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    return $admin;
}

function placeOrder(string $reference, string $session = 'wa-cart')
{
    return test()->withSession(['shop' => $session])->postJson('/pedido-whatsapp', ['reference' => $reference]);
}

it('registers the cart as a pending order when the WhatsApp button is pressed', function () {
    $fridge = orderProduct('Refrigeradora', 3299, 5, 3000);
    $tv = orderProduct('Televisor', 2500, 3);
    cartWith([[$fridge, 1, 3000], [$tv, 2, 2500]]);

    placeOrder('SH-7K3P9Q')->assertCreated()->assertJson(['reference' => 'SH-7K3P9Q']);

    $order = Order::with('orderItems')->sole();
    expect($order->status)->toBe(Order::PENDING)
        ->and($order->reference)->toBe('SH-7K3P9Q')
        ->and((float) $order->total)->toBe(8000.0)
        ->and($order->orderItems)->toHaveCount(2)
        ->and((float) $order->orderItems->firstWhere('product_id', $fridge->id)->unit_price)->toBe(3000.0);

    // Pendiente: el stock no cambia, y el carrito sigue intacto
    expect(Inventory::where('product_id', $fridge->id)->value('stock'))->toBe(5)
        ->and(CartItem::count())->toBe(2);
});

it('is idempotent for the same reference and replaces an untouched pending order of the same cart', function () {
    $fridge = orderProduct('Refrigeradora', 3299, 5);
    cartWith([[$fridge, 1, 3299]]);

    placeOrder('SH-AAAAAA')->assertCreated();
    placeOrder('SH-AAAAAA')->assertCreated();
    expect(Order::count())->toBe(1);

    placeOrder('SH-BBBBBB')->assertCreated();
    $old = Order::where('reference', 'SH-AAAAAA')->first();
    expect($old->status)->toBe(Order::CANCELLED)
        ->and($old->cancel_reason)->toContain('SH-BBBBBB')
        ->and(Order::where('reference', 'SH-BBBBBB')->value('status'))->toBe(Order::PENDING);
});

it('does not replace a pending order that was already edited in the panel', function () {
    $fridge = orderProduct('Refrigeradora', 3299, 5);
    cartWith([[$fridge, 1, 3299]]);
    placeOrder('SH-AAAAAA');
    Order::where('reference', 'SH-AAAAAA')->update(['edited_at' => now()]);

    placeOrder('SH-BBBBBB');

    expect(Order::where('status', Order::PENDING)->count())->toBe(2);
});

it('rejects empty carts, bad references and references from another cart', function () {
    $fridge = orderProduct('Refrigeradora', 3299, 5);
    placeOrder('SH-AAAAAA')->assertStatus(422);
    placeOrder('hola')->assertStatus(422);

    cartWith([[$fridge, 1, 3299]], 'cart-a');
    cartWith([[$fridge, 1, 3299]], 'cart-b');
    placeOrder('SH-AAAAAA', 'cart-a')->assertCreated();
    placeOrder('SH-AAAAAA', 'cart-b')->assertStatus(409);
    expect(Order::count())->toBe(1);
});

it('lists orders with pending first for admins and hides them from guests', function () {
    $fridge = orderProduct('Refrigeradora', 3299, 5);
    cartWith([[$fridge, 1, 3299]]);
    placeOrder('SH-AAAAAA');

    $this->get(route('admin.orders.index'))->assertRedirect('/login');

    $this->actingAs(ordersAdmin())
        ->get(route('admin.orders.index', ['search' => 'Refri']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders/Index')
            ->where('counts.pending', 1)
            ->where('records.data.0.code', 'SH-AAAAAA')
            ->where('records.data.0.preview.0', 'Refrigeradora'));
});

it('edits a pending order: quantities, added and removed products and customer data', function () {
    $fridge = orderProduct('Refrigeradora', 3299, 5, 3000);
    $tv = orderProduct('Televisor', 2500, 3);
    $oven = orderProduct('Horno', 800, 4, 700);
    cartWith([[$fridge, 1, 3000], [$tv, 1, 2500]]);
    placeOrder('SH-AAAAAA');
    $order = Order::with('orderItems')->sole();
    $fridgeLine = $order->orderItems->firstWhere('product_id', $fridge->id);

    // El precio de la refrigeradora sube: la línea existente conserva el precio pactado
    Inventory::where('product_id', $fridge->id)->update(['offer_amount' => null, 'ini' => null, 'fin' => null]);

    $this->actingAs(ordersAdmin())
        ->put(route('admin.orders.update', $order), [
            'items' => [
                ['id' => $fridgeLine->id, 'product_id' => $fridge->id, 'quantity' => 2],
                ['id' => null, 'product_id' => $oven->id, 'quantity' => 1],
            ],
            'customer_name' => 'Ana Pérez',
            'customer_phone' => '+591 70000000',
            'notes' => 'Entrega el sábado',
        ])
        ->assertSessionHasNoErrors()
        ->assertSessionHas('success');

    $order->refresh()->load('orderItems');
    expect($order->orderItems)->toHaveCount(2)
        ->and($order->orderItems->pluck('product_id')->all())->not->toContain($tv->id)
        ->and((float) $order->orderItems->firstWhere('product_id', $fridge->id)->unit_price)->toBe(3000.0)
        ->and((float) $order->orderItems->firstWhere('product_id', $oven->id)->unit_price)->toBe(700.0)
        ->and((float) $order->total)->toBe(6700.0)
        ->and($order->customer_name)->toBe('Ana Pérez')
        ->and($order->edited_at)->not->toBeNull();
});

it('confirms a pending order and discounts the stock, all or nothing', function () {
    $fridge = orderProduct('Refrigeradora', 3299, 5);
    $tv = orderProduct('Televisor', 2500, 1);
    cartWith([[$fridge, 2, 3299], [$tv, 2, 2500]]);
    placeOrder('SH-AAAAAA');
    $order = Order::sole();
    $admin = ordersAdmin();

    // Falta stock del televisor: no se descuenta nada
    $this->actingAs($admin)->post(route('admin.orders.confirm', $order))->assertSessionHas('error');
    expect($order->fresh()->status)->toBe(Order::PENDING)
        ->and(Inventory::where('product_id', $fridge->id)->value('stock'))->toBe(5);

    Inventory::where('product_id', $tv->id)->update(['stock' => 4]);
    $this->post(route('admin.orders.confirm', $order))->assertSessionHas('success');

    expect($order->fresh()->status)->toBe(Order::CONFIRMED)
        ->and($order->fresh()->confirmed_at)->not->toBeNull()
        ->and(Inventory::where('product_id', $fridge->id)->value('stock'))->toBe(3)
        ->and(Inventory::where('product_id', $tv->id)->value('stock'))->toBe(2);

    // Confirmado: ya no se puede editar ni volver a confirmar
    $this->put(route('admin.orders.update', $order), ['items' => [['product_id' => $fridge->id, 'quantity' => 1]]])->assertSessionHas('error');
    $this->post(route('admin.orders.confirm', $order))->assertSessionHas('error');
    expect(Inventory::where('product_id', $fridge->id)->value('stock'))->toBe(3);
});

it('cancels orders and returns the units when the sale was already confirmed', function () {
    $fridge = orderProduct('Refrigeradora', 3299, 5);
    cartWith([[$fridge, 2, 3299]]);
    placeOrder('SH-AAAAAA');
    $order = Order::sole();
    $this->actingAs(ordersAdmin());

    $this->post(route('admin.orders.confirm', $order));
    expect(Inventory::where('product_id', $fridge->id)->value('stock'))->toBe(3);

    $this->post(route('admin.orders.cancel', $order), ['reason' => 'El cliente desistió'])->assertSessionHas('success');
    expect($order->fresh()->status)->toBe(Order::CANCELLED)
        ->and($order->fresh()->cancel_reason)->toBe('El cliente desistió')
        ->and(Inventory::where('product_id', $fridge->id)->value('stock'))->toBe(5);

    $this->post(route('admin.orders.cancel', $order))->assertSessionHas('error');
    expect(Inventory::where('product_id', $fridge->id)->value('stock'))->toBe(5);
});

it('lets read-only roles view orders but not change them', function () {
    $fridge = orderProduct('Refrigeradora', 3299, 5);
    cartWith([[$fridge, 1, 3299]]);
    placeOrder('SH-AAAAAA');
    $order = Order::sole();

    seedRbac();
    $role = \App\Models\Role::create(['name' => 'vendedor', 'description' => 'Solo ver pedidos']);
    $role->permissions()->sync(\App\Models\Permission::whereIn('name', ['view_orders', 'access_dashboard'])->pluck('id'));
    $viewer = User::factory()->create();
    $viewer->assignRole('vendedor');

    $this->actingAs($viewer)->get(route('admin.orders.show', $order))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/orders/Show')->where('order.items.0.name', 'Refrigeradora'));
    $this->post(route('admin.orders.confirm', $order))->assertForbidden();
    expect($order->fresh()->status)->toBe(Order::PENDING);
});

it('searches products with their current price and stock to add them to an order', function () {
    orderProduct('Horno', 800, 4, 700);

    $this->actingAs(ordersAdmin())
        ->getJson(route('admin.orders.products', ['q' => 'Hor']))
        ->assertOk()
        ->assertJsonPath('0.name', 'Horno')
        ->assertJsonPath('0.price', 700)
        ->assertJsonPath('0.on_offer', true)
        ->assertJsonPath('0.stock', 4);
});
