<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use DomainException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Pedidos por WhatsApp. El stock solo cambia al confirmar (se descuenta) o al cancelar un
 * pedido ya confirmado (se devuelve); un pedido pendiente no reserva unidades.
 */
class OrderService
{
    /**
     * Registra el pedido del carrito con la referencia que el cliente envía por WhatsApp.
     * Repetir la misma referencia devuelve el mismo pedido (doble clic). Un pedido pendiente
     * anterior del mismo carrito que nadie tocó en el panel queda cancelado y apunta al nuevo,
     * porque el carrito no se vacía y el último mensaje ya lo incluye todo.
     */
    public function placeFromCart(Cart $cart, string $reference, ?int $userId = null): ?Order
    {
        return DB::transaction(function () use ($cart, $reference, $userId) {
            if ($existing = Order::where('reference', $reference)->first()) {
                return $existing;
            }

            $items = $cart->cartItems()->get();
            if ($items->isEmpty()) {
                return null;
            }

            Order::where('card_id', $cart->id)
                ->where('status', Order::PENDING)
                ->whereNull('edited_at')
                ->update([
                    'status' => Order::CANCELLED,
                    'cancelled_at' => now(),
                    'cancel_reason' => "Reemplazado por el pedido {$reference}",
                ]);

            $order = Order::create([
                'card_id' => $cart->id,
                'user_id' => $userId ?? 0,
                'reference' => $reference,
                'status' => Order::PENDING,
                'money' => self::currency($items->first()->money),
                'total' => 0,
            ]);

            foreach ($items as $item) {
                $order->orderItems()->create([
                    'product_id' => $item->product_id,
                    'name' => $item->name,
                    'image' => $item->image,
                    'quantity' => $item->amount,
                    'unit_price' => $item->unit_price,
                    'money' => self::currency($item->money),
                    'amount' => self::cents($item->unit_price) * $item->amount / 100,
                ]);
            }

            return $this->refreshTotal($order);
        });
    }

    /**
     * Edita un pedido pendiente: cantidades, productos agregados o quitados y datos del cliente.
     * Las líneas existentes conservan el precio pactado; las nuevas toman el precio vigente.
     *
     * @param  array<int, array{id?: int|null, product_id: int, quantity: int}>  $lines
     * @param  array{customer_name?: ?string, customer_phone?: ?string, notes?: ?string}  $customer
     */
    public function update(Order $order, array $lines, array $customer, User $editor): Order
    {
        return DB::transaction(function () use ($order, $lines, $customer, $editor) {
            $order = Order::lockForUpdate()->findOrFail($order->id);
            $this->ensurePending($order, 'editar');

            $current = $order->orderItems()->get()->keyBy('id');
            $keep = [];
            $seen = [];

            foreach ($lines as $line) {
                $productId = (int) $line['product_id'];
                $quantity = (int) $line['quantity'];

                // Mismo producto dos veces: se suman en una sola línea
                if (isset($seen[$productId])) {
                    $seen[$productId]->quantity += $quantity;
                    continue;
                }

                $item = isset($line['id']) ? $current->get((int) $line['id']) : null;
                if ($item && (int) $item->product_id === $productId) {
                    $item->quantity = $quantity;
                } else {
                    $product = Product::with('inventory')->find($productId);
                    if (! $product?->inventory) {
                        throw new DomainException('Uno de los productos ya no existe o no tiene precio en Stock.');
                    }
                    $item = new OrderItem([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'name' => $product->name,
                        'image' => $product->image,
                        'unit_price' => $product->inventory->currentPrice(),
                        'money' => self::currency($product->inventory->money),
                    ]);
                    $item->quantity = $quantity;
                }
                $seen[$productId] = $item;
            }

            foreach ($seen as $item) {
                $item->amount = self::cents($item->unit_price) * $item->quantity / 100;
                $item->save();
                $keep[] = $item->id;
            }
            $order->orderItems()->whereNotIn('id', $keep)->delete();

            $order->fill([
                'customer_name' => $customer['customer_name'] ?? null,
                'customer_phone' => $customer['customer_phone'] ?? null,
                'notes' => $customer['notes'] ?? null,
                'money' => self::currency(collect($seen)->first()?->money ?? $order->money),
                'edited_at' => now(),
                'updated_by' => $editor->id,
            ])->save();

            return $this->refreshTotal($order);
        });
    }

    /** Confirma la venta y descuenta el stock de cada producto (todo o nada). */
    public function confirm(Order $order, User $editor): Order
    {
        return DB::transaction(function () use ($order, $editor) {
            $order = Order::lockForUpdate()->findOrFail($order->id);
            $this->ensurePending($order, 'confirmar');

            $items = $order->orderItems()->get();
            if ($items->isEmpty()) {
                throw new DomainException('El pedido no tiene productos.');
            }

            $quantities = $this->quantities($items);
            $inventories = Inventory::whereIn('product_id', $quantities->keys())->lockForUpdate()->get()->keyBy('product_id');

            $problems = [];
            foreach ($quantities as $productId => $qty) {
                $name = $items->firstWhere('product_id', $productId)?->name ?? "#{$productId}";
                $inventory = $inventories->get($productId);
                if (! $inventory) {
                    $problems[] = "{$name}: no tiene registro de stock";
                } elseif ($inventory->stock < $qty) {
                    $problems[] = "{$name}: pide {$qty}, hay {$inventory->stock}";
                }
            }
            if ($problems) {
                throw new DomainException('No hay stock suficiente. '.implode(' · ', $problems).'.');
            }

            foreach ($quantities as $productId => $qty) {
                Inventory::where('product_id', $productId)->decrement('stock', $qty);
            }

            $order->update([
                'status' => Order::CONFIRMED,
                'confirmed_at' => now(),
                'updated_by' => $editor->id,
            ]);

            return $order;
        });
    }

    /** Cancela el pedido; si ya estaba confirmado, devuelve las unidades al stock. */
    public function cancel(Order $order, User $editor, ?string $reason = null): Order
    {
        return DB::transaction(function () use ($order, $editor, $reason) {
            $order = Order::lockForUpdate()->findOrFail($order->id);
            if ($order->status === Order::CANCELLED) {
                throw new DomainException('El pedido ya está cancelado.');
            }

            if ($order->status === Order::CONFIRMED) {
                foreach ($this->quantities($order->orderItems()->get()) as $productId => $qty) {
                    Inventory::where('product_id', $productId)->increment('stock', $qty);
                }
            }

            $order->update([
                'status' => Order::CANCELLED,
                'cancelled_at' => now(),
                'cancel_reason' => $reason ?: null,
                'updated_by' => $editor->id,
            ]);

            return $order;
        });
    }

    /** "BOB", "Bo", "bs" → "Bs." (igual que currencyLabel() del frontend). */
    public static function currency(?string $money): string
    {
        $money = trim((string) $money);

        return in_array(strtoupper($money), ['', 'BOB', 'BO', 'BS', 'BS.'], true) ? 'Bs.' : $money;
    }

    private static function cents(mixed $value): int
    {
        return (int) round(((float) $value) * 100);
    }

    private function ensurePending(Order $order, string $action): void
    {
        if (! $order->isPending()) {
            throw new DomainException("Solo se puede {$action} un pedido pendiente.");
        }
    }

    /** @return Collection<int, int> product_id => unidades */
    private function quantities(Collection $items): Collection
    {
        return $items->whereNotNull('product_id')
            ->groupBy('product_id')
            ->map(fn ($group) => (int) $group->sum('quantity'));
    }

    private function refreshTotal(Order $order): Order
    {
        $cents = $order->orderItems()->get()->sum(fn ($item) => self::cents($item->unit_price) * $item->quantity);
        $order->update(['total' => $cents / 100]);

        return $order;
    }
}
