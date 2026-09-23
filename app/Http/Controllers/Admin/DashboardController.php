<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

use App\Traits\PostTrait;
use Inertia\Inertia;

use App\Models\Banner;
use App\Models\Subcategory;
use App\Models\Category;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\Order;

class DashboardController extends Controller
{
    use PostTrait;

    public function dashboard(){
        $lowStock = Inventory::with('product')
            ->whereNotNull('stock')
            ->where('stock', '<=', 5)
            ->orderBy('stock', 'asc')
            ->limit(8)
            ->get()
            ->map(fn ($i) => [
                'id' => $i->id,
                'name' => $i->product?->name ?? '—',
                'stock' => (int) ($i->stock ?? 0),
            ]);

        $recentOrders = Order::with('user')
            ->withCount('orderItems')
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'user' => $o->user?->name ?? 'Invitado',
                'total' => (float) $o->total,
                'items' => (int) $o->order_items_count,
                'created_at' => optional($o->created_at)->toDateTimeString(),
            ]);

        $startOfMonth = now()->startOfMonth();
        $revenueMonth = (float) Order::where('created_at', '>=', $startOfMonth)->sum('total');
        $ordersMonth = Order::where('created_at', '>=', $startOfMonth)->count();

        return Inertia::render('admin/dashboard', [
            'products' => Product::count(),
            'categories' => Category::count(),
            'subcategorieds' => Subcategory::count(),
            'banners' => Banner::count(),
            'lowStock' => $lowStock,
            'recentOrders' => $recentOrders,
            'revenueMonth' => $revenueMonth,
            'ordersMonth' => $ordersMonth,
        ]);
    }

}

