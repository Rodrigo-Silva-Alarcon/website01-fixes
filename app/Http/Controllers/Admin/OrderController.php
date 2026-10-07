<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\OrderService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin › Pedidos: pedidos que llegan por WhatsApp. Pendiente → se puede editar,
 * confirmar (descuenta stock) o cancelar; confirmado → se puede cancelar (devuelve stock).
 */
class OrderController extends Controller
{
    public function __construct(private OrderService $orders)
    {
    }

    public function index(Request $request): Response
    {
        $status = in_array($request->query('status'), Order::STATUSES, true) ? $request->query('status') : null;
        $search = trim((string) $request->query('search', ''));

        $orders = Order::query()
            ->with(['orderItems:id,order_id,name,quantity'])
            ->withCount('orderItems')
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($search !== '', function ($q) use ($search) {
                $term = '%'.$search.'%';
                $q->where(function ($w) use ($term, $search) {
                    $w->where('reference', 'like', $term)
                        ->orWhere('customer_name', 'like', $term)
                        ->orWhere('customer_phone', 'like', $term)
                        ->orWhereHas('orderItems', fn ($i) => $i->where('name', 'like', $term));
                    if (ctype_digit(ltrim($search, '#'))) {
                        $w->orWhere('id', (int) ltrim($search, '#'));
                    }
                });
            })
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Order $order) => [
                'id' => $order->id,
                'code' => $order->code,
                'status' => $order->status,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'total' => (float) $order->total,
                'money' => $order->money ?: 'Bs.',
                'items_count' => $order->order_items_count,
                'units' => (int) $order->orderItems->sum('quantity'),
                'preview' => $order->orderItems->take(2)->pluck('name')->all(),
                'created_at' => optional($order->created_at)->toIso8601String(),
                'edited' => $order->edited_at !== null,
            ]);

        $startOfMonth = now()->startOfMonth();

        return Inertia::render('admin/orders/Index', [
            'records' => $orders,
            'filters' => ['status' => $status, 'search' => $search],
            'counts' => [
                'all' => Order::count(),
                Order::PENDING => Order::where('status', Order::PENDING)->count(),
                Order::CONFIRMED => Order::where('status', Order::CONFIRMED)->count(),
                Order::CANCELLED => Order::where('status', Order::CANCELLED)->count(),
            ],
            'month' => [
                'confirmed' => Order::where('status', Order::CONFIRMED)->where('confirmed_at', '>=', $startOfMonth)->count(),
                'revenue' => (float) Order::where('status', Order::CONFIRMED)->where('confirmed_at', '>=', $startOfMonth)->sum('total'),
                'pending_total' => (float) Order::where('status', Order::PENDING)->sum('total'),
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['orderItems.product.inventory', 'editor:id,name']);

        // "Reemplazado por el pedido SH-XXXXXX" → enlace al pedido nuevo
        $replacement = null;
        if ($order->cancel_reason && preg_match('/(SH-[A-Z0-9]{6})/', $order->cancel_reason, $m)) {
            $replacement = Order::where('reference', $m[1])->first(['id', 'reference']);
        }

        return Inertia::render('admin/orders/Show', [
            'order' => [
                'id' => $order->id,
                'code' => $order->code,
                'reference' => $order->reference,
                'status' => $order->status,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'customer_address' => $order->customer_address,
                'notes' => $order->notes,
                'money' => $order->money ?: 'Bs.',
                'total' => (float) $order->total,
                'created_at' => optional($order->created_at)->toIso8601String(),
                'edited_at' => optional($order->edited_at)->toIso8601String(),
                'confirmed_at' => optional($order->confirmed_at)->toIso8601String(),
                'cancelled_at' => optional($order->cancelled_at)->toIso8601String(),
                'cancel_reason' => $order->cancel_reason,
                'editor' => $order->editor?->name,
                'replacement' => $replacement ? ['id' => $replacement->id, 'code' => $replacement->reference] : null,
                'items' => $order->orderItems->map(fn (OrderItem $item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'name' => $item->name,
                    'quantity' => (int) $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'money' => $item->money ?: ($order->money ?: 'Bs.'),
                    'image' => $item->product?->image_thumbs_url ?? $item->product?->image_url,
                    'stock' => $item->product?->inventory ? (int) $item->product->inventory->stock : null,
                    'current_price' => $item->product?->inventory ? $item->product->inventory->currentPrice() : null,
                ])->values(),
            ],
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.id' => ['nullable', 'integer'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
            'customer_name' => ['nullable', 'string', 'max:120'],
            'customer_phone' => ['nullable', 'string', 'max:40', 'regex:/^[0-9+\s\-()]{6,40}$/'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ], [
            'items.required' => 'El pedido debe tener al menos un producto.',
            'items.min' => 'El pedido debe tener al menos un producto.',
            'items.*.quantity.min' => 'La cantidad mínima es 1.',
            'items.*.quantity.max' => 'La cantidad máxima es 999.',
            'customer_phone.regex' => 'El teléfono no tiene un formato válido.',
        ]);

        return $this->attempt(fn () => $this->orders->update($order, $data['items'], $data, $request->user()), 'Pedido actualizado.');
    }

    public function confirm(Request $request, Order $order): RedirectResponse
    {
        return $this->attempt(fn () => $this->orders->confirm($order, $request->user()), 'Pedido confirmado. Se descontó el stock.');
    }

    public function cancel(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate(['reason' => ['nullable', 'string', 'max:160']]);
        $wasConfirmed = $order->status === Order::CONFIRMED;

        return $this->attempt(
            fn () => $this->orders->cancel($order, $request->user(), $data['reason'] ?? null),
            $wasConfirmed ? 'Pedido cancelado. Las unidades volvieron al stock.' : 'Pedido cancelado.',
        );
    }

    /** Buscador de productos para agregar al pedido: precio vigente (oferta incluida) y stock. */
    public function products(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));

        $products = Product::with(['inventory', 'brand:id,name'])
            ->where('active', true)
            ->whereHas('inventory')
            ->when($search !== '', fn ($q) => $q->where('name', 'like', '%'.$search.'%'))
            ->orderBy('name')
            ->limit(20)
            ->get()
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'brand' => $product->brand?->name,
                'image' => $product->image_thumbs_url ?? $product->image_url,
                'price' => $product->inventory->currentPrice(),
                'regular_price' => (float) $product->inventory->amount,
                'on_offer' => $product->inventory->isOnOffer(),
                'stock' => (int) $product->inventory->stock,
                'money' => OrderService::currency($product->inventory->money),
            ]);

        return response()->json($products);
    }

    private function attempt(callable $action, string $success): RedirectResponse
    {
        try {
            $action();
        } catch (DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', $success);
    }
}
