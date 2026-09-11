<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CartItemRequest;
use App\Models\CartItem;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class CartItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View
    {
        $cartItems = CartItem::with(['cart.user', 'product'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        
        return view('admin.cart-items.index', compact('cartItems'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        $carts = Cart::with('user')->orderBy('created_at', 'desc')->get();
        $products = Product::where('active', 'Si')->orderBy('name')->get();
        
        return view('admin.cart-items.create', compact('carts', 'products'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CartItemRequest $request): RedirectResponse
    {
        CartItem::create($request->validated());

        return redirect()->route('admin.cart-items.index')
            ->with('success', 'Item del carrito creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(CartItem $cartItem): View
    {
        $cartItem->load(['cart.user', 'product']);
        
        return view('admin.cart-items.show', compact('cartItem'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CartItem $cartItem): View
    {
        $carts = Cart::with('user')->orderBy('created_at', 'desc')->get();
        $products = Product::where('active', 'Si')->orderBy('name')->get();
        
        return view('admin.cart-items.edit', compact('cartItem', 'carts', 'products'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CartItemRequest $request, CartItem $cartItem): RedirectResponse
    {
        $cartItem->update($request->validated());

        return redirect()->route('admin.cart-items.index')
            ->with('success', 'Item del carrito actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CartItem $cartItem): RedirectResponse
    {
        $cartItem->delete();

        return redirect()->route('admin.cart-items.index')
            ->with('success', 'Item del carrito eliminado exitosamente.');
    }
}





