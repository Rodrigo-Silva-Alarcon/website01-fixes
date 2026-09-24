<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Cart as CartModel;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function show(Request $request)
    {
        $cart = $this->sessionCart();

        if (!$cart || $cart->cartItems->isEmpty()) {
            return redirect()->route('home')->with('status', 'Tu carrito está vacío.');
        }

        return Inertia::render('web/CheckoutPage', [
            'cart' => $cart,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:120',
            'customer_phone' => 'required|string|max:40',
            'customer_email' => 'nullable|email|max:200',
            'customer_address' => 'nullable|string|max:250',
            'notes' => 'nullable|string|max:1000',
            'payment_method' => 'required|string|in:transfer,cash,whatsapp',
        ], [
            'customer_name.required' => 'El nombre es obligatorio.',
            'customer_phone.required' => 'El teléfono es obligatorio.',
            'payment_method.required' => 'Selecciona una forma de pago.',
        ]);

        $cart = $this->sessionCart();

        if (!$cart || $cart->cartItems->isEmpty()) {
            return redirect()->route('home')->with('status', 'Tu carrito está vacío.');
        }

        try {
            $order = DB::transaction(function () use ($data, $cart) {
                $items = $cart->cartItems()->get();
                $total = $items->sum(fn ($item) => (int) round(((float) $item->unit_price) * 100) * $item->amount) / 100;

                $quantities = $items->groupBy('product_id')
                    ->map(fn ($group) => (int) $group->sum('amount'));

                foreach ($quantities as $productId => $qty) {
                    $inventory = Inventory::where('product_id', $productId)
                        ->lockForUpdate()
                        ->first();

                    if ($inventory !== null && (int) $inventory->stock < $qty) {
                        throw new \RuntimeException('stock_insufficient');
                    }
                }

                $order = Order::create([
                    'card_id' => $cart->id,
                    'user_id' => auth()->id() ?? 0,
                    'total' => $total,
                    'customer_name' => $data['customer_name'],
                    'customer_phone' => $data['customer_phone'],
                    'customer_email' => $data['customer_email'] ?? null,
                    'customer_address' => $data['customer_address'] ?? null,
                    'notes' => $data['notes'] ?? null,
                    'payment_method' => $data['payment_method'],
                    'status' => 'pending',
                ]);

                foreach ($items as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item->product_id,
                        'name' => $item->name,
                        'image' => $item->image,
                        'amount' => $item->sub_total,
                        'quantity' => $item->amount,
                        'unit_price' => $item->unit_price,
                    ]);
                }

                foreach ($quantities as $productId => $qty) {
                    Inventory::where('product_id', $productId)
                        ->decrement('stock', $qty);
                }

                Payment::create([
                    'user_id' => auth()->id() ?? 0,
                    'order_id' => $order->id,
                    'status' => 'init',
                    'amount' => $total,
                    'tipe_pay' => $data['payment_method'],
                ]);

                $items->each->delete();
                $cart->delete();

                return $order;
            });
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'stock_insufficient') {
                return redirect()
                    ->route('checkout')
                    ->with('status', 'Stock insuficiente para uno o más productos. Ajusta las cantidades.');
            }

            throw $e;
        }

        session()->forget('shop');

        return redirect()
            ->route('checkout.success', $order->id)
            ->with('status', 'Pedido registrado correctamente.');
    }

    public function success(int $orderId)
    {
        $order = Order::with('orderItems')->findOrFail($orderId);

        return Inertia::render('web/CheckoutSuccessPage', [
            'order' => $order,
        ]);
    }

    private function sessionCart(): ?Cart
    {
        if (!session()->has('shop')) {
            return null;
        }

        return CartModel::with(['cartItems.product.inventory', 'cartItems.product.images'])
            ->where('cart_session', session('shop'))
            ->first();
    }
}
