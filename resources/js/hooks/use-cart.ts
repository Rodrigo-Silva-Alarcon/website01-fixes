import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { toast } from "sonner";
import { Cart, CartItem, Product } from "@/types/models";
import { cartTotals, itemSubtotal } from "@/lib/cart";
import { isOnOffer } from "@/lib/product-enquiry";

export function formatMoney(money: string, cents: number) {
  return `${money} ${(cents / 100).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function productHref(product?: Product | null) {
  if (!product) return route("products");
  return route("product", {
    product: product.slug,
    category: product.category_slug || product.category?.slug,
    subcategory: product.subcategory_slug || "All",
  });
}

/** Precio de lista (sin oferta) en centavos cuando la línea se agregó con descuento vigente. */
export function listCents(item: CartItem): number | null {
  const inv = item.product?.inventory;
  if (!inv || !isOnOffer(inv)) return null;
  const base = Math.round(Number(inv.amount) * 100);
  return base > Math.round(Number(item.unit_price) * 100) ? base * item.amount : null;
}

/**
 * Estado del carrito compartido por el panel lateral y la página /carrito:
 * cantidades optimistas, eliminación animada y totales.
 */
export function useCart() {
  const { cart, cartSuggestions, populares = [] } = usePage<{
    cart: (Cart & { cartItems?: CartItem[] }) | null;
    cartSuggestions?: Product[];
    populares?: Product[];
  }>().props;
  const serverItems: CartItem[] = cart?.cart_items ?? cart?.cartItems ?? [];

  const [pendingQty, setPendingQty] = useState<Record<number, number>>({});
  const [removing, setRemoving] = useState<Record<number, boolean>>({});

  const items = serverItems.map((it) => ({ ...it, amount: pendingQty[it.product_id] ?? it.amount }));
  const live = items.filter((it) => !removing[it.product_id]);

  const changeQty = (item: CartItem, amount: number) => {
    if (amount < 1 || amount > 9999) return;
    setPendingQty((q) => ({ ...q, [item.product_id]: amount }));
    router.patch(route("updateshop", { product: item.product_id }), { amount }, {
      preserveScroll: true,
      preserveState: true,
      onError: () => toast.error("No se pudo actualizar la cantidad. Inténtalo nuevamente."),
      onFinish: () =>
        setPendingQty((q) => {
          const next = { ...q };
          delete next[item.product_id];
          return next;
        }),
    });
  };

  const remove = (item: CartItem) => {
    setRemoving((r) => ({ ...r, [item.product_id]: true }));
    // deja terminar el colapso de la fila antes de pedir al servidor
    setTimeout(() => {
      router.post(route("removeshop", { product: item.product_id }), {}, {
        preserveScroll: true,
        preserveState: true,
        onError: () => {
          toast.error("No se pudo eliminar el producto.");
          setRemoving((r) => ({ ...r, [item.product_id]: false }));
        },
      });
    }, 350);
  };

  const add = (product: Product) =>
    router.post(route("addshop", { product: product.id }), {}, { preserveScroll: true, preserveState: true });

  const count = live.reduce((n, it) => n + it.amount, 0);
  const totals = cartTotals(live);
  const currencies = Object.keys(totals);
  const single = currencies.length === 1 ? currencies[0] : null;
  const saved = live.reduce((n, it) => n + Math.max((listCents(it) ?? 0) - itemSubtotal(it), 0), 0);
  const subtotal = single ? totals[single] + saved : 0;

  const inCart = new Set(serverItems.map((it) => it.product_id));
  // el servidor ya trae populares + otros con stock (mín. 5); populares queda como respaldo
  const suggestions = (cartSuggestions ?? populares).filter((p) => !inCart.has(p.id) && (p.inventory?.stock ?? 0) > 0);

  return {
    items,
    live,
    count,
    totals,
    currencies,
    single,
    saved,
    subtotal,
    suggestions,
    hasItems: live.length > 0,
    empty: live.length === 0 && !Object.values(removing).some(Boolean),
    isBusy: (item: CartItem) => pendingQty[item.product_id] !== undefined,
    isRemoving: (item: CartItem) => !!removing[item.product_id],
    changeQty,
    remove,
    add,
  };
}
