import { Link, router, useForm, usePage } from "@inertiajs/react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Banknote,
  Check,
  ChevronRight,
  CircleAlert,
  Landmark,
  Lock,
  MapPin,
  MessageCircle,
  Minus,
  Navigation,
  Plus,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import Layout from "./layouts/Layout";
import Seo from "@/components/Seo";
import ResponsiveImg from "@/components/ResponsiveImg";
import { Cart, CartItem, PagePropsMessage } from "@/types/models";
import { cartTotals, itemSubtotal, whatsappCartUrl } from "@/lib/cart";
import { useCms } from "@/lib/cms";

type Mode = "delivery" | "pickup";

const PAYMENT_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "transfer", label: "Transferencia bancaria", icon: Landmark },
  { value: "cash", label: "Pago en efectivo (contra entrega)", icon: Banknote },
  { value: "whatsapp", label: "Coordinar por WhatsApp", icon: MessageCircle },
];

const MODE_OPTIONS: { value: Mode; label: string; sub: string; icon: LucideIcon }[] = [
  { value: "delivery", label: "Delivery a domicilio", sub: "Gratis · entrega en 24 h", icon: Truck },
  { value: "pickup", label: "Retiro en tienda", sub: "Showroom en La Paz", icon: Store },
];

const SHOWROOM = "Av. 20 de Octubre esq. Rosendo Gutierrez, Edif. Guadalquivir #2332";
const PICKUP_ADDRESS = `Retiro en tienda: ${SHOWROOM}`;
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOWROOM + ", La Paz, Bolivia")}`;

const inputCls =
  "h-[52px] w-full rounded-2xl border-[1.5px] border-[#dfe2e6] bg-white px-[18px] text-base text-[#191c1f] outline-none transition-[border-color,box-shadow] placeholder:text-[#8a8f94] focus:border-[#fa8232] focus:shadow-[0_0_0_4px_rgba(250,130,50,.15)]";
const cardCls = "flex flex-col gap-5 rounded-3xl border border-[#eceef0] bg-white p-5 sm:p-6 lg:p-8";

function SectionHead({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fa8232] font-bold text-white">
        {n}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
        <p className="text-sm text-[#6b7076]">{sub}</p>
      </div>
    </div>
  );
}

function Radio({ on }: { on: boolean }) {
  return (
    <span
      className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
        on ? "border-[#fa8232]" : "border-[#cacccd]"
      }`}
    >
      <span className={`size-2.5 rounded-full ${on ? "bg-[#fa8232]" : "bg-transparent"}`} />
    </span>
  );
}

function IconBox({ icon: Icon, on }: { icon: LucideIcon; on: boolean }) {
  return (
    <span
      className={`flex size-11 shrink-0 items-center justify-center rounded-[14px] ${
        on ? "bg-[#fa8232] text-white" : "bg-[#f2f4f5] text-[#191c1f]"
      }`}
    >
      <Icon size={22} aria-hidden />
    </span>
  );
}

const Field = ({ label, error, children }: { label: React.ReactNode; error?: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-2">
    <span className="text-sm font-semibold">{label}</span>
    {children}
    {error && <span className="text-[13px] text-[#d9534f]">{error}</span>}
  </label>
);

const SummaryItem = memo(function SummaryItem({
  item,
  disabled,
  onQty,
}: {
  item: CartItem;
  disabled: boolean;
  onQty: (item: CartItem, amount: number) => void;
}) {
  return (
    <li className="flex gap-3 border-b border-[#eceef0] py-3">
      <div className="size-16 shrink-0 overflow-hidden rounded-[14px] bg-[#f6f7f8] p-2">
        <ResponsiveImg alt="" className="size-full object-contain mix-blend-multiply" src={item.image_url} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex justify-between gap-2.5">
          <span className="text-sm font-semibold leading-snug">{item.name}</span>
          <span className="whitespace-nowrap text-[15px] font-bold tabular-nums">
            {item.money} {(itemSubtotal(item) / 100).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center rounded-full border border-[#dfe2e6] p-0.5">
            <button
              type="button"
              aria-label={`Disminuir cantidad de ${item.name}`}
              disabled={disabled || item.amount <= 1}
              onClick={() => onQty(item, item.amount - 1)}
              className="flex size-[30px] items-center justify-center rounded-full hover:bg-[#f4f5f6] disabled:opacity-40"
            >
              <Minus size={14} aria-hidden />
            </button>
            <span className="min-w-6 text-center text-sm font-semibold">{item.amount}</span>
            <button
              type="button"
              aria-label={`Aumentar cantidad de ${item.name}`}
              disabled={disabled || item.amount >= 9999}
              onClick={() => onQty(item, item.amount + 1)}
              className="flex size-[30px] items-center justify-center rounded-full hover:bg-[#f4f5f6] disabled:opacity-40"
            >
              <Plus size={14} aria-hidden />
            </button>
          </div>
          <span className="text-xs text-[#8a8f94]">
            {item.money} {Number(item.unit_price).toFixed(2)} c/u
          </span>
        </div>
      </div>
    </li>
  );
});

export default function CheckoutPage() {
  const { whatsapp } = useCms();
  const { cart, flash } = usePage<{ cart: Cart | null; flash: PagePropsMessage["flash"] }>().props;
  const items: CartItem[] = useMemo(() => cart?.cart_items ?? [], [cart]);
  const totals = useMemo(() => cartTotals(items), [items]);
  const count = useMemo(() => items.reduce((n, i) => n + i.amount, 0), [items]);
  const [qtyPending, setQtyPending] = useState(false);
  const [mode, setMode] = useState<Mode>("delivery");
  const [mapQuery, setMapQuery] = useState("");

  const { data, setData, post, processing, errors, transform } = useForm({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    notes: "",
    payment_method: "transfer",
  });

  // El retiro en tienda no pide dirección, pero el backend la requiere.
  transform((d) => (mode === "pickup" ? { ...d, customer_address: PICKUP_ADDRESS } : d));

  useEffect(() => {
    const t = setTimeout(() => setMapQuery(data.customer_address.trim()), 700);
    return () => clearTimeout(t);
  }, [data.customer_address]);

  const changeQty = useCallback((item: CartItem, amount: number) => {
    if (amount < 1 || amount > 9999) return;
    setQtyPending(true);
    router.patch(`/shop/${item.product_id}`, { amount }, {
      preserveScroll: true,
      preserveState: true,
      onError: () => toast.error("No se pudo actualizar la cantidad. Inténtalo nuevamente."),
      onFinish: () => setQtyPending(false),
    });
  }, []);

  if (items.length === 0) {
    return (
      <Layout>
        <Seo title="Checkout" description="Finaliza tu pedido en Smart House." />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <p className="mb-4">Tu carrito está vacío.</p>
          <Link href="/productos" className="text-[#fa8232] font-semibold">
            Ver productos
          </Link>
        </main>
      </Layout>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return;
    post("/checkout", {
      preserveScroll: true,
      onError: () => toast.error("Revisa los datos del formulario."),
    });
  };

  const hasErr = Object.keys(errors).length > 0;
  const totalEntries = Object.entries(totals);
  const delivery = mode === "delivery";

  return (
    <Layout>
      <Seo title="Checkout" description="Finaliza tu pedido en Smart House." />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-7 px-4 pb-28 pt-5 text-[#191c1f] [color-scheme:light] sm:px-8 sm:pt-6 lg:px-12 lg:pb-24 xl:px-16">
        <div className="flex flex-col gap-4">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-[#6b7076]">
            <Link href="/">Inicio</Link>
            <ChevronRight size={16} aria-hidden />
            <Link href="/carrito">Mi carrito</Link>
            <ChevronRight size={16} aria-hidden />
            <span className="text-[#191c1f]">Realizar pedido</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-[clamp(32px,4vw,44px)] font-bold leading-none tracking-[-0.035em]">Realizar pedido</h1>
            <ol aria-label="Pasos del pedido" className="flex flex-wrap items-center gap-2 text-sm">
              <li className="flex items-center gap-2 text-[#6b7076]">
                <span className="flex size-[26px] items-center justify-center rounded-full bg-[#fff4ec] text-[#c2410c]">
                  <Check size={15} aria-hidden />
                </span>
                Carrito
              </li>
              <li className="flex items-center gap-2 font-semibold" aria-current="step">
                <span className="h-[1.5px] w-5 bg-[#fa8232] sm:w-7" />
                <span className="flex size-[26px] items-center justify-center rounded-full bg-[#fa8232] text-[13px] text-white">
                  2
                </span>
                Datos<span className="hidden sm:inline"> de entrega</span>
              </li>
              <li className="flex items-center gap-2 text-[#6b7076]">
                <span className="h-[1.5px] w-5 bg-[#dfe2e6] sm:w-7" />
                <span className="flex size-[26px] items-center justify-center rounded-full border-[1.5px] border-[#dfe2e6] text-[13px]">
                  3
                </span>
                Confirmación
              </li>
            </ol>
          </div>
          {flash?.status && <p className="text-sm text-[#c2410c]">{flash.status}</p>}
        </div>

        <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-8 xl:gap-10">
          <form id="checkout-form" onSubmit={submit} className="flex w-full min-w-0 flex-1 flex-col gap-4">
            <section className={cardCls}>
              <SectionHead n={1} title="Tus datos" sub="Te contactaremos por WhatsApp para coordinar la entrega." />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nombre completo *" error={errors.customer_name}>
                  <input
                    type="text"
                    value={data.customer_name}
                    onChange={(e) => setData("customer_name", e.target.value)}
                    autoComplete="name"
                    placeholder="Tu nombre"
                    className={inputCls}
                  />
                </Field>
                <Field label="Teléfono / WhatsApp *" error={errors.customer_phone}>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={data.customer_phone}
                    onChange={(e) => setData("customer_phone", e.target.value)}
                    autoComplete="tel"
                    placeholder="7XXXXXXX"
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field
                label={
                  <>
                    Email <span className="font-normal text-[#6b7076]">(opcional)</span>
                  </>
                }
                error={errors.customer_email}
              >
                <input
                  type="email"
                  inputMode="email"
                  value={data.customer_email}
                  onChange={(e) => setData("customer_email", e.target.value)}
                  autoComplete="email"
                  placeholder="tu@email.com"
                  className={inputCls}
                />
              </Field>
            </section>

            <section className={cardCls}>
              <SectionHead n={2} title="Entrega" sub="Elige cómo quieres recibir tu pedido." />
              <div role="radiogroup" aria-label="Tipo de entrega" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {MODE_OPTIONS.map((m) => {
                  const on = mode === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setMode(m.value)}
                      className={`flex items-center gap-3.5 rounded-[18px] border-[1.5px] px-[18px] py-4 text-left transition-colors ${
                        on ? "border-[#fa8232] bg-[#fff4ec]" : "border-[#dfe2e6] bg-white hover:border-[#cacccd]"
                      }`}
                    >
                      <IconBox icon={m.icon} on={on} />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="font-bold">{m.label}</span>
                        <span className="text-[13px] text-[#6b7076]">{m.sub}</span>
                      </span>
                      <Radio on={on} />
                    </button>
                  );
                })}
              </div>

              {delivery ? (
                <>
                  <Field label="Dirección de entrega" error={errors.customer_address}>
                    <input
                      type="text"
                      value={data.customer_address}
                      onChange={(e) => setData("customer_address", e.target.value)}
                      autoComplete="street-address"
                      placeholder="Calle, número, zona y referencia"
                      className={inputCls}
                    />
                  </Field>
                  <div className="relative overflow-hidden rounded-[18px] border border-[#eceef0] bg-[#f6f7f8]">
                    {mapQuery ? (
                      <iframe
                        title="Mapa de ubicación de entrega"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                        className="block h-48 w-full border-0 sm:h-60"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : (
                      <div className="flex h-32 flex-col items-center justify-center gap-2 px-4 text-center text-sm text-[#6b7076] sm:h-40">
                        <MapPin size={22} aria-hidden />
                        Escribe tu dirección y el mapa mostrará la ubicación.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[#fde3cf] bg-[#fff4ec] px-5 py-[18px]">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="font-bold">Showroom Smart House</span>
                    <span className="text-sm text-[#3d4247]">{SHOWROOM}</span>
                    <span className="text-[13px] text-[#6b7076]">
                      Lunes - Viernes: 9:00 AM - 6:00 PM · Sábado: 10:00 AM - 4:00 PM
                    </span>
                  </div>
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full border-[1.5px] border-[#fa8232] bg-white px-[18px] py-2.5 text-sm font-semibold text-[#c2410c] transition-colors hover:bg-[#fa8232] hover:text-white"
                  >
                    <Navigation size={18} aria-hidden />
                    Cómo llegar
                  </a>
                </div>
              )}

              <Field
                label={
                  <>
                    Notas <span className="font-normal text-[#6b7076]">(opcional)</span>
                  </>
                }
                error={errors.notes}
              >
                <textarea
                  value={data.notes}
                  onChange={(e) => setData("notes", e.target.value)}
                  rows={3}
                  placeholder="Horario preferido, piso, referencias…"
                  className="w-full resize-y rounded-2xl border-[1.5px] border-[#dfe2e6] bg-white px-[18px] py-3.5 text-base leading-relaxed text-[#191c1f] outline-none transition-[border-color,box-shadow] placeholder:text-[#8a8f94] focus:border-[#fa8232] focus:shadow-[0_0_0_4px_rgba(250,130,50,.15)]"
                />
              </Field>
            </section>

            <section className={cardCls}>
              <SectionHead n={3} title="Forma de pago" sub="Pagas cuando confirmamos tu pedido." />
              <div role="radiogroup" aria-label="Forma de pago" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {PAYMENT_OPTIONS.map((p) => {
                  const on = data.payment_method === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setData("payment_method", p.value)}
                      className={`relative flex items-center gap-3.5 rounded-[18px] border-[1.5px] p-[18px] text-left transition-colors sm:flex-col sm:items-start ${
                        on ? "border-[#fa8232] bg-[#fff4ec]" : "border-[#dfe2e6] bg-white hover:border-[#cacccd]"
                      }`}
                    >
                      <IconBox icon={p.icon} on={on} />
                      <span className="flex-1 pr-7 text-[15px] font-bold leading-snug sm:pr-0">{p.label}</span>
                      <span className="absolute right-4 top-4 sm:top-[18px]">
                        <Radio on={on} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.payment_method && <p className="text-[13px] text-[#d9534f]">{errors.payment_method}</p>}
            </section>
          </form>

          <aside className="flex w-full flex-col gap-3.5 rounded-[28px] border border-[#eceef0] bg-white p-5 sm:p-6 lg:sticky lg:top-4 lg:w-[380px] lg:shrink-0 xl:w-[420px]">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-bold">Resumen del pedido</h2>
              <Link href="/carrito" className="text-sm font-semibold text-[#c2410c]">
                Editar carrito
              </Link>
            </div>
            <ul className="flex flex-col lg:max-h-[40vh] lg:overflow-y-auto">
              {items.map((item) => (
                <SummaryItem key={item.id} item={item} disabled={qtyPending} onQty={changeQty} />
              ))}
            </ul>
            <div className="flex justify-between text-[15px] text-[#5b6066]">
              <span>Productos ({count})</span>
            </div>
            <div className="flex justify-between text-[15px] text-[#5b6066]">
              <span>{delivery ? "Delivery" : "Retiro en tienda"}</span>
              <span className="font-semibold text-[#c2410c]">Gratis</span>
            </div>
            <div className="h-px bg-[#eceef0]" />
            {totalEntries.map(([money, cents]) => (
              <div key={money} className="flex items-baseline justify-between gap-3">
                <span className="text-[17px] font-bold">Total</span>
                <span className="text-[28px] font-bold tracking-tight tabular-nums sm:text-3xl">
                  {money} {(cents / 100).toFixed(2)}
                </span>
              </div>
            ))}
            <button
              type="submit"
              form="checkout-form"
              disabled={processing}
              className="flex items-center justify-center gap-2 rounded-full bg-[#fa8232] px-[22px] py-[15px] text-base font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(250,130,50,.35)] disabled:opacity-60"
            >
              <Lock size={18} aria-hidden />
              {processing ? "Enviando…" : "Confirmar pedido"}
            </button>
            {hasErr && (
              <span className="flex items-center justify-center gap-2 text-sm text-[#d9534f]" role="alert">
                <CircleAlert size={16} aria-hidden />
                Revisa los datos del formulario.
              </span>
            )}
            <a
              href={whatsappCartUrl(items, whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border-[1.5px] border-[#fa8232] px-[22px] py-[13px] text-[15px] font-semibold text-[#c2410c] transition-colors hover:bg-[#fff4ec]"
            >
              <MessageCircle size={20} aria-hidden />
              Enviar solo por WhatsApp
            </a>
            <ul className="flex flex-col gap-3 pt-1.5 text-sm text-[#3d4247]">
              <li className="flex items-center gap-2.5">
                <Truck size={20} className="shrink-0 text-[#c2410c]" aria-hidden />
                Delivery gratuito, entrega en 24 h
              </li>
              <li className="flex items-center gap-2.5">
                <Lock size={20} className="shrink-0 text-[#c2410c]" aria-hidden />
                Pago seguro: transferencia, QR o efectivo
              </li>
            </ul>
          </aside>
        </div>
      </main>

      {/* Barra fija en móvil/tablet: total + confirmar siempre a mano */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-[#eceef0] bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(25,28,31,.08)] backdrop-blur lg:hidden">
        <div className="flex min-w-0 flex-col text-[#191c1f]">
          <span className="text-xs text-[#6b7076]">Total ({count})</span>
          <span className="truncate text-lg font-bold tabular-nums">
            {totalEntries.map(([money, cents]) => `${money} ${(cents / 100).toFixed(2)}`).join(" + ")}
          </span>
        </div>
        <button
          type="submit"
          form="checkout-form"
          disabled={processing}
          className="flex shrink-0 items-center gap-2 rounded-full bg-[#fa8232] px-6 py-3 font-bold text-white disabled:opacity-60"
        >
          <Lock size={16} aria-hidden />
          {processing ? "Enviando…" : "Confirmar"}
        </button>
      </div>
    </Layout>
  );
}
