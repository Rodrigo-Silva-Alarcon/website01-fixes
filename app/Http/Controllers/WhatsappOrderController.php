<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Al pulsar "Pedir por WhatsApp" la web avisa aquí (en segundo plano) con la referencia
 * que va en el mensaje, y el carrito de la sesión queda registrado como pedido pendiente.
 * WhatsApp se abre igual aunque esta petición falle.
 */
class WhatsappOrderController extends Controller
{
    public function store(Request $request, OrderService $orders): JsonResponse
    {
        $data = $request->validate([
            'reference' => ['required', 'string', 'regex:/^SH-[A-Z0-9]{6}$/'],
        ]);

        $cart = session()->has('shop') ? Cart::where('cart_session', session('shop'))->first() : null;
        $order = $cart ? $orders->placeFromCart($cart, $data['reference'], auth()->id()) : null;

        if (! $order) {
            return response()->json(['message' => 'El carrito está vacío.'], 422);
        }

        // Una referencia ya usada por otro carrito no se reasigna
        if ((int) $order->card_id !== (int) $cart->id) {
            return response()->json(['message' => 'Referencia no válida.'], 409);
        }

        return response()->json(['reference' => $order->reference], 201);
    }
}
