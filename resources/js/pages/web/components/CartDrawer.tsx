import { useEffect, useRef, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ArrowRight, ChevronLeft, ChevronRight, Maximize2, MessageCircle, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import ResponsiveImg from "@/components/ResponsiveImg";
import { CartItem, Product } from "@/types/models";
import { currencyLabel, itemSubtotal, whatsappCartUrl } from "@/lib/cart";
import { productPrice } from "@/lib/product-enquiry";
import { formatMoney as fmt, listCents, productHref, useCart } from "@/hooks/use-cart";
import { useSmoothRail } from "@/hooks/use-smooth-rail";
import { useCms } from "@/lib/cms";

/** Páginas donde el carrito ya está a la vista y el botón flotante sobra. */
const HIDE_ON = ["web/CarritoPage", "web/CheckoutPage", "web/CheckoutSuccessPage"];

function DrawerLine({ item, busy, removing, onQty, onRemove }: {
  item: CartItem;
  busy: boolean;
  removing: boolean;
  onQty: (amount: number) => void;
  onRemove: () => void;
}) {
  const p = item.product;
  const money = currencyLabel(item.money);
  const old = listCents(item);
  const stock = p?.inventory?.stock ?? Infinity;
  const href = productHref(p);

  return (
    <div
      className="grid transition-[grid-template-rows,opacity] duration-[350ms] ease-[cubic-bezier(.2,.8,.2,1)]"
      style={{ gridTemplateRows: removing ? "0fr" : "1fr", opacity: removing ? 0 : 1 }}
    >
      <div className="overflow-hidden">
        <div className="flex gap-3.5 border-b border-[#eceef0] py-4">
          <Link href={href} className="relative flex aspect-square w-[clamp(72px,18vw,92px)] flex-none items-center justify-center overflow-hidden rounded-2xl bg-[#f6f7f8]">
            <ResponsiveImg
              src={p?.image_url || item.image_url}
              webpSrc={p?.image_webp_url}
              alt=""
              className="absolute inset-[10%] size-[80%] object-contain mix-blend-multiply"
            />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex justify-between gap-2.5">
              <div className="flex min-w-0 flex-col gap-0.5">
                {p?.brand_label && <span className="text-xs font-semibold uppercase tracking-[.06em] text-[#6b7076]">{p.brand_label}</span>}
                <Link href={href} className="text-[15px] font-semibold leading-[1.3] hover:text-[#c2410c]">
                  {item.name}
                </Link>
              </div>
              <div className="flex flex-none flex-col items-end">
                <span className="whitespace-nowrap text-base font-bold tabular-nums">{fmt(money, itemSubtotal(item))}</span>
                <span className="min-h-4 text-xs text-[#8a8f94] line-through">{old ? fmt(money, old) : ""}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center rounded-full border border-[#dfe2e6] p-0.5">
                <button
                  type="button"
                  onClick={() => onQty(item.amount - 1)}
                  disabled={busy || item.amount <= 1}
                  aria-label={`Quitar una unidad de ${item.name}`}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full hover:bg-[#f4f5f6] disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-7 text-center text-[15px] font-semibold tabular-nums" aria-live="polite">{item.amount}</span>
                <button
                  type="button"
                  onClick={() => onQty(item.amount + 1)}
                  disabled={busy || item.amount >= stock}
                  aria-label={`Añadir una unidad de ${item.name}`}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full hover:bg-[#f4f5f6] disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={onRemove}
                disabled={removing}
                className="flex cursor-pointer items-center gap-1 py-1.5 text-sm text-[#6b7076] transition-colors hover:text-[#d9534f]"
              >
                <Trash2 className="size-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Fila horizontal de sugerencias: se desplaza con las flechas, la rueda del mouse,
 * arrastrando o con el dedo, y encaja suavemente tarjeta por tarjeta (ver useSmoothRail).
 */
function SuggestionsRail({ products, onAdd }: { products: Product[]; onAdd: (p: Product) => void }) {
  const railRef = useRef<HTMLDivElement>(null);
  // tarjeta de 150px + 10px de separación
  const { edges, page, handlers } = useSmoothRail(railRef, 160, [products.length]);

  return (
    <div className="flex flex-col gap-3 pt-[22px]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-bold uppercase tracking-[.1em] text-[#6b7076]">Te puede interesar</span>
        <div className="flex gap-1.5">
          {([-1, 1] as const).map((dir) => {
            const Icon = dir < 0 ? ChevronLeft : ChevronRight;
            const disabled = dir < 0 ? edges.start : edges.end;
            return (
              <button
                key={dir}
                type="button"
                onClick={() => page(dir)}
                disabled={disabled}
                aria-label={dir < 0 ? "Ver sugerencias anteriores" : "Ver más sugerencias"}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-[#dfe2e6] bg-white text-[#191c1f] transition-colors hover:border-[#fa8232] hover:text-[#c2410c] disabled:cursor-default disabled:opacity-35 disabled:hover:border-[#dfe2e6] disabled:hover:text-[#191c1f]"
              >
                <Icon className="size-[18px]" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div
          ref={railRef}
          {...handlers}
          onPointerCancel={handlers.onPointerUp}
          className="cart-rail flex cursor-grab gap-2.5 overflow-x-auto overscroll-x-contain px-0.5 pb-2.5 select-none"
        >
          {products.map((p) => {
            const price = productPrice(p.inventory);
            return (
              <div
                key={p.id}
                className="flex w-[150px] flex-none flex-col gap-2 rounded-[18px] border border-[#eceef0] bg-white p-2 transition-colors hover:border-[#dfe2e6]"
              >
                <Link href={productHref(p)} draggable={false} className="relative aspect-square overflow-hidden rounded-xl bg-[#f6f7f8]">
                  <ResponsiveImg
                    src={p.image_url}
                    webpSrc={p.image_webp_url}
                    alt=""
                    draggable={false}
                    className="absolute inset-[12%] size-[76%] object-contain mix-blend-multiply"
                  />
                </Link>
                <Link
                  href={productHref(p)}
                  draggable={false}
                  className="min-h-[34px] text-[13px] font-semibold leading-[1.3] line-clamp-2 hover:text-[#c2410c]"
                >
                  {p.name}
                </Link>
                <div className="mt-auto flex items-center justify-between gap-1">
                  <span className="text-sm font-bold tabular-nums">
                    {price !== null ? fmt(currencyLabel(p.inventory?.money || "Bs."), Math.round(price * 100)) : "Consultar"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAdd(p)}
                    aria-label={`Añadir ${p.name} al carrito`}
                    className="flex size-8 flex-none cursor-pointer items-center justify-center rounded-full bg-[#fa8232] text-white transition-transform hover:scale-110"
                  >
                    <Plus className="size-[18px]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Carrito versión 1: panel lateral que se abre desde el botón flotante naranja.
 * El botón "ampliar" del panel lleva a la versión 2 (/carrito).
 */
export default function CartDrawer() {
  const { whatsapp } = useCms();
  const { component } = usePage();
  const { items, live, count, totals, currencies, single, saved, subtotal, suggestions, hasItems, empty, isBusy, isRemoving, changeQty, remove, add } =
    useCart();
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const prevCount = useRef(count);
  const closeRef = useRef<HTMLButtonElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // el contador del botón "salta" cuando entra un producto nuevo
  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 300);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    fabRef.current?.focus();
  };
  const expand = () => {
    setOpen(false);
    router.visit(route("cart"));
  };

  if (HIDE_ON.includes(component)) return null;

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Abrir carrito (${count} ${count === 1 ? "producto" : "productos"})`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`cart-fab fixed bottom-5 right-5 z-[65] flex size-14 cursor-pointer items-center justify-center rounded-full bg-[#fa8232] text-white shadow-[0_12px_28px_rgba(250,130,50,.45)] transition-[translate,scale,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:bg-[#f9751d] hover:shadow-[0_16px_34px_rgba(250,130,50,.5)] sm:bottom-7 sm:right-7 sm:size-16 ${
          open ? "pointer-events-none scale-75 opacity-0" : ""
        }`}
      >
        <ShoppingCart className="size-6 sm:size-7" />
        {count > 0 && (
          <span
            className={`absolute -right-1 -top-1 min-w-[22px] rounded-full border-2 border-white bg-[#191c1f] px-1.5 text-center text-xs font-bold leading-[18px] text-white transition-transform duration-300 ease-[cubic-bezier(.3,1.6,.5,1)] ${
              bump ? "scale-[1.35]" : "scale-100"
            }`}
          >
            {count}
          </span>
        )}
      </button>

      <div className={`fixed inset-0 z-[70] font-dm_sans text-[#191c1f] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open} inert={!open}>
        <div
          onClick={close}
          className={`absolute inset-0 bg-[rgba(25,28,31,.4)] transition-opacity duration-[350ms] ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mi carrito"
          inert={!open}
          className={`absolute bottom-0 right-0 top-0 flex w-[min(100vw,500px)] flex-col bg-white shadow-[-24px_0_48px_rgba(25,28,31,.14)] transition-transform duration-[450ms] ease-[cubic-bezier(.2,.8,.2,1)] ${
            open ? "translate-x-0" : "translate-x-[calc(100%+60px)]"
          }`}
        >
          <div className="flex items-center gap-2 border-b border-[#eceef0] px-[clamp(16px,3vw,28px)] pb-[18px] pt-[22px]">
            <span className="flex-1 text-[clamp(24px,2.4vw,30px)] font-bold tracking-[-.02em]">Mi carrito</span>
            <span className="mr-1 text-sm text-[#6b7076]">
              {count} {count === 1 ? "producto" : "productos"}
            </span>
            <button
              type="button"
              onClick={expand}
              aria-label="Ampliar carrito"
              title="Ampliar carrito"
              className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#f4f5f6] transition-colors hover:bg-[#fff4ec] hover:text-[#c2410c]"
            >
              <Maximize2 className="size-[19px]" />
            </button>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Cerrar carrito"
              className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#f4f5f6] transition-colors hover:bg-[#e4e7e9]"
            >
              <X className="size-[22px]" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-[clamp(16px,3vw,28px)] pb-5 pt-2">
            {items.map((item) => (
              <DrawerLine
                key={item.id}
                item={item}
                busy={isBusy(item)}
                removing={isRemoving(item)}
                onQty={(amount) => changeQty(item, amount)}
                onRemove={() => remove(item)}
              />
            ))}

            {empty && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-3 py-12 text-center">
                <span className="flex size-[72px] items-center justify-center rounded-full bg-[#fff4ec] text-[#fa8232]">
                  <ShoppingCart className="size-8" />
                </span>
                <span className="text-xl font-bold">Tu carrito está vacío</span>
                <span className="text-[15px] text-[#6b7076]">Selecciona productos para empezar tu pedido.</span>
                <Link
                  href={route("products")}
                  onClick={() => setOpen(false)}
                  className="mt-1 rounded-full bg-[#fa8232] px-[22px] py-3 font-semibold text-white hover:bg-[#f9751d] hover:text-white"
                >
                  Ver productos
                </Link>
              </div>
            )}

            {suggestions.length > 0 && <SuggestionsRail products={suggestions} onAdd={add} />}
          </div>

          {hasItems && (
            <div className="flex flex-col gap-3 border-t border-[#eceef0] bg-white px-[clamp(16px,3vw,28px)] pb-[22px] pt-[18px]">
              {single && (
                <>
                  <div className="flex justify-between text-[15px] text-[#5b6066]">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{fmt(single, subtotal)}</span>
                  </div>
                  {saved > 0 && (
                    <div className="flex justify-between text-[15px] font-semibold text-[#c2410c]">
                      <span>Descuentos</span>
                      <span className="tabular-nums">− {fmt(single, saved)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between text-[15px] text-[#5b6066]">
                <span>Delivery</span>
                <span className="font-semibold text-[#155eef]">Gratis</span>
              </div>
              <div className="flex items-baseline justify-between pt-1.5">
                <span className="text-[17px] font-bold">Total</span>
                <span className="flex flex-col items-end">
                  {currencies.map((m) => (
                    <span key={m} className="text-[26px] font-bold tabular-nums tracking-[-.02em]">{fmt(m, totals[m])}</span>
                  ))}
                </span>
              </div>
              <Link
                href={route("checkout")}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-[#fa8232] px-[22px] py-[15px] text-base font-bold text-white transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:text-white hover:shadow-[0_10px_24px_rgba(250,130,50,.35)]"
              >
                Realizar pedido
                <ArrowRight className="size-5" />
              </Link>
              <a
                href={whatsappCartUrl(live, whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border-[1.5px] border-[#fa8232] px-[22px] py-[13px] text-[15px] font-semibold text-[#c2410c] transition-colors hover:bg-[#fff4ec]"
              >
                <MessageCircle className="size-5" />
                Solicitar pedido por WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
