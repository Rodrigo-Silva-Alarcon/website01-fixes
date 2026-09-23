<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    /**
     * Listado de carritos (§4.7.17) — antes apuntaba a Blade inexistente.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->query('search', '');

        $carts = Cart::with(['user', 'cartItems'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('user', function ($u) use ($search) {
                        $u->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })->orWhere('cart_session', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/carts/Index', [
            'records' => $carts,
            'filters' => ['search' => $search],
        ]);
    }

    public function destroy(Cart $cart)
    {
        $cart->delete();

        return redirect()->route('admin.carts.index')
            ->with('success', 'Carrito eliminado exitosamente.');
    }
}
