import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ArrowLeft, ChevronRight, Lock, Minus, Plus, ShoppingCart, Store, Trash2, Truck } from "lucide-react";
import Layout from "@/pages/web/layouts/Layout";
import Seo from "@/components/Seo";
import ResponsiveImg from "@/components/ResponsiveImg";
import ProductCard from "@/pages/web/components/ProductCard";
import WhatsAppIcon from "@/pages/web/components/WhatsAppIcon";
import ClearCartButton from "@/pages/web/components/ClearCartButton";
import { CartItem } from "@/types/models";
import { currencyLabel, itemSubtotal, whatsappCartUrl } from "@/lib/cart";
import { formatMoney as fmt, listCents, productHref, useCart } from "@/hooks/use-cart";
import { useCms } from "@/lib/cms";

function CartLine({ item, qty, busy, removing, onQty, onRemove }: {
  item: CartItem;
  qty: number;
  busy: boolean;
  removing: boolean;
  onQty: (amount: number) => void;
  onRemove: () => void;
}) {
  const p = item.product;
  const money = currencyLabel(item.money);
  const line = { ...item, amount: qty };
  const old = listCents(line);
  const stock = p?.inventory?.stock ?? Infinity;
  const meta = [p?.brand_label, p?.subcategory_label || p?.category_label].filter(Boolean).join(" · ");
  const href = productHref(p);

  return (
    <div
      className="cart-line grid transition-[grid-template-rows,opacity] duration-[350ms] ease-[cubic-bezier(.2,.8,.2,1)]"
      style={{ gridTemplateRows: removing ? "0fr" : "1fr", opacity: removing ? 0 : 1 }}
    >
      <div className="overflow-hidden">
        <div className="mb-3 flex flex-wrap items-center gap-[clamp(12px,2vw,20px)] rounded-[24px] border border-[#eceef0] p-3">
          <Link href={href} className="relative flex aspect-square w-[clamp(88px,12vw,128px)] flex-none items-center justify-center overflow-hidden rounded-[18px] bg-[#f6f7f8]">
            <ResponsiveImg
              src={p?.image_url || item.image_url}
              webpSrc={p?.image_webp_url}
              alt=""
              className="absolute inset-[10%] size-[80%] object-contain mix-blend-multiply"
            />
          </Link>
          <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-1">
            {meta && <span className="text-xs font-semibold uppercase tracking-[.06em] text-[#6b7076]">{meta}</span>}
            <Link href={href} className="text-[17px] font-semibold leading-[1.3] hover:text-[#c2410c]">
              {item.name}
            </Link>
            <span className="text-sm text-[#6b7076]">{fmt(money, Math.round(Number(item.unit_price) * 100))} c/u</span>
          </div>
          <div className="ml-auto flex items-center gap-[clamp(12px,2vw,24px)]">
            <div className="flex items-center rounded-full border border-[#dfe2e6] p-[3px]">
              <button
                type="button"
                onClick={() => onQty(qty - 1)}
                disabled={busy || qty <= 1}
                aria-label={`Quitar una unidad de ${item.name}`}
                className="flex size-10 cursor-pointer items-center justify-center rounded-full text-[#191c1f] hover:bg-[#f4f5f6] disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
              >
                <Minus className="size-[18px]" />
              </button>
              <span className="min-w-[30px] text-center text-base font-semibold tabular-nums" aria-live="polite">{qty}</span>
              <button
                type="button"
                onClick={() => onQty(qty + 1)}
                disabled={busy || qty >= stock}
                aria-label={`Añadir una unidad de ${item.name}`}
                title={qty >= stock ? "No hay más stock disponible" : undefined}
                className="flex size-10 cursor-pointer items-center justify-center rounded-full text-[#191c1f] hover:bg-[#f4f5f6] disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
              >
                <Plus className="size-[18px]" />
              </button>
            </div>
            <div className="flex min-w-24 flex-col items-end">
              <span className="whitespace-nowrap text-lg font-bold tabular-nums">{fmt(money, itemSubtotal(line))}</span>
              <span className="min-h-[18px] text-[13px] text-[#8a8f94] line-through">{old ? fmt(money, old) : ""}</span>
            </div>
            <button
              type="button"
              onClick={onRemove}
              disabled={removing}
              aria-label={`Eliminar ${item.name} del carrito`}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#f4f5f6] text-[#5b6066] transition-colors duration-200 hover:bg-[#fdecea] hover:text-[#d9534f]"
            >
              <Trash2 className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarritoPage() {
  const { whatsapp, addressLines, store } = useCms();
  const { items, live, count, totals, currencies, single, saved, subtotal, suggestions, hasItems, empty, isBusy, isRemoving, changeQty, remove, clear } =
    useCart();
  const upsell = suggestions.slice(0, 4);
  const address = addressLines.slice(0, 2).join(", ");
  const perks = [
    { icon: Truck, t: store("cart_perk_delivery") },
    { icon: Lock, t: store("cart_perk_payment") },
    { icon: Store, t: `${store("pickup_label")}: ${address}` },
  ];

  return (
    <Layout>
      <Seo title="Mi carrito" description="Revisa los productos de tu carrito y envía tu pedido por WhatsApp a Smart House." />
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-[clamp(16px,4.4vw,64px)] pb-[clamp(64px,8vw,96px)] pt-[clamp(20px,3vw,32px)] font-dm_sans text-[#191c1f]">
        <div className="flex flex-col gap-[18px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#6b7076]">
            <Link href={route("home")} className="hover:text-[#c2410c]">Inicio</Link>
            <ChevronRight className="size-4" />
            <span className="text-[#191c1f]">Mi carrito</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-baseline gap-3.5">
              <h1 className="m-0 text-[clamp(32px,4vw,44px)] font-bold leading-none tracking-[-.035em]">Mi carrito</h1>
              <span className="text-[15px] text-[#6b7076]">
                {count} {count === 1 ? "producto" : "productos"}
              </span>
            </div>
            {hasItems && <ClearCartButton onClear={clear} />}
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-[clamp(20px,3vw,40px)]">
          <div className="flex min-w-[min(100%,300px)] flex-[1_1_560px] flex-col">
            {items.map((item) => (
              <CartLine
                key={item.id}
                item={item}
                qty={item.amount}
                busy={isBusy(item)}
                removing={isRemoving(item)}
                onQty={(amount) => changeQty(item, amount)}
                onRemove={() => remove(item)}
              />
            ))}

            {empty && (
              <div style={{ animation: "sh-rise .5s cubic-bezier(.2,.7,.2,1) both" }} className="mb-3 flex flex-col items-center gap-3.5 rounded-[24px] border border-dashed border-[#dfe2e6] px-6 py-14 text-center">
                <span className="flex size-[72px] items-center justify-center rounded-full bg-[#fff4ec] text-[#fa8232]">
                  <ShoppingCart className="size-8" />
                </span>
                <span className="text-xl font-bold">Tu carrito está vacío</span>
                <span className="text-[15px] text-[#6b7076]">Selecciona productos para empezar tu pedido.</span>
                <Link href={route("products")} className="mt-1 rounded-full bg-[#fa8232] px-[22px] py-3 font-semibold text-white hover:bg-[#f9751d] hover:text-white">
                  Ver productos
                </Link>
              </div>
            )}

            <Link href={route("products")} className="flex items-center gap-1.5 self-start py-2 text-[15px] font-semibold text-[#155eef] hover:underline">
              <ArrowLeft className="size-5" />
              Seguir comprando
            </Link>
          </div>

          <aside className="flex w-full flex-[1_1_340px] flex-col gap-3.5 rounded-[28px] border border-[#eceef0] p-[clamp(20px,2.4vw,28px)] min-[980px]:sticky min-[980px]:top-4 min-[980px]:max-w-[400px]">
            <span className="text-xl font-bold">Resumen del pedido</span>
            {single ? (
              <>
                <div className="flex justify-between text-[15px] text-[#5b6066]">
                  <span>Subtotal ({count})</span>
                  <span className="tabular-nums">{fmt(single, subtotal)}</span>
                </div>
                {saved > 0 && (
                  <div className="flex justify-between text-[15px] font-semibold text-[#c2410c]">
                    <span>Descuentos</span>
                    <span className="tabular-nums">− {fmt(single, saved)}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between text-[15px] text-[#5b6066]">
                <span>Subtotal ({count})</span>
                <span>—</span>
              </div>
            )}
            <div className="flex justify-between text-[15px] text-[#5b6066]">
              <span>{store("delivery_label")}</span>
              <span className="font-semibold text-[#155eef]">{store("delivery_value")}</span>
            </div>
            <div className="h-px bg-[#eceef0]" />
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[17px] font-bold">Total</span>
              <span className="flex flex-col items-end">
                {currencies.length ? (
                  currencies.map((m) => (
                    <span key={m} className="text-[30px] font-bold tabular-nums tracking-[-.02em]">{fmt(m, totals[m])}</span>
                  ))
                ) : (
                  <span className="text-[30px] font-bold tracking-[-.02em]">Bs. 0,00</span>
                )}
              </span>
            </div>

            {/* El pedido se cierra por WhatsApp; /checkout queda sin enlaces hasta eliminarlo */}
            {hasItems ? (
              <a
                href={whatsappCartUrl(live, whatsapp, store("wa_order_intro"))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#fa8232] px-[22px] py-[15px] text-base font-bold text-white transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:text-white hover:shadow-[0_10px_24px_rgba(250,130,50,.35)]"
              >
                <WhatsAppIcon className="size-5" />
                {store("order_button")}
              </a>
            ) : (
              <span className="flex cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[#d5d9de] px-[22px] py-[15px] text-base font-bold text-white" aria-disabled="true">
                <WhatsAppIcon className="size-5" />
                {store("order_button")}
              </span>
            )}

            <ul className="m-0 flex list-none flex-col gap-3 p-0 pt-1.5">
              {perks.map(({ icon: Icon, t }) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-[#3d4247]">
                  <Icon className="size-5 flex-none text-[#155eef]" />
                  {t}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {upsell.length > 0 && (
          <section className="flex flex-col gap-5 pt-[clamp(24px,4vw,48px)]">
            <h2 className="m-0 text-[clamp(26px,2.8vw,34px)] font-bold tracking-[-.03em]">Completa tu compra</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,150px),1fr))] gap-[clamp(10px,1.2vw,16px)] sm:grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))]">
              {upsell.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
