<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CartRequest;
use App\Models\Cart;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class CartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View
    {
        $carts = Cart::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        
        return view('admin.carts.index', compact('carts'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        $users = User::orderBy('name')->get();
        
        return view('admin.carts.create', compact('users'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CartRequest $request): RedirectResponse
    {
        Cart::create($request->validated());

        return redirect()->route('admin.carts.index')
            ->with('success', 'Carrito creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Cart $cart): View
    {
        $cart->load(['user', 'cartItems.product', 'orders']);
        
        return view('admin.carts.show', compact('cart'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Cart $cart): View
    {
        $users = User::orderBy('name')->get();
        
        return view('admin.carts.edit', compact('cart', 'users'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CartRequest $request, Cart $cart): RedirectResponse
    {
        $cart->update($request->validated());

        return redirect()->route('admin.carts.index')
            ->with('success', 'Carrito actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cart $cart): RedirectResponse
    {
        $cart->delete();

        return redirect()->route('admin.carts.index')
            ->with('success', 'Carrito eliminado exitosamente.');
    }
}





