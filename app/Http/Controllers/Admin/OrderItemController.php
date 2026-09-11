<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderItemRequest;
use App\Models\OrderItem;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class OrderItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View
    {
        $orderItems = OrderItem::with(['order.cart.user', 'product'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        
        return view('admin.order-items.index', compact('orderItems'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        $orders = Order::with('cart.user')->orderBy('created_at', 'desc')->get();
        $products = Product::where('active', 'Si')->orderBy('name')->get();
        
        return view('admin.order-items.create', compact('orders', 'products'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(OrderItemRequest $request): RedirectResponse
    {
        OrderItem::create($request->validated());

        return redirect()->route('admin.order-items.index')
            ->with('success', 'Item de la orden creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(OrderItem $orderItem): View
    {
        $orderItem->load(['order.cart.user', 'product']);
        
        return view('admin.order-items.show', compact('orderItem'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(OrderItem $orderItem): View
    {
        $orders = Order::with('cart.user')->orderBy('created_at', 'desc')->get();
        $products = Product::where('active', 'Si')->orderBy('name')->get();
        
        return view('admin.order-items.edit', compact('orderItem', 'orders', 'products'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(OrderItemRequest $request, OrderItem $orderItem): RedirectResponse
    {
        $orderItem->update($request->validated());

        return redirect()->route('admin.order-items.index')
            ->with('success', 'Item de la orden actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OrderItem $orderItem): RedirectResponse
    {
        $orderItem->delete();

        return redirect()->route('admin.order-items.index')
            ->with('success', 'Item de la orden eliminado exitosamente.');
    }
}





