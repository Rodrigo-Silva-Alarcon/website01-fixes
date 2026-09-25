import { Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Layout from "./layouts/Layout";
import Seo from "@/components/Seo";
import ResponsiveImg from "@/components/ResponsiveImg";
import { Cart, CartItem, PagePropsMessage } from "@/types/models";
import { cartTotals, itemSubtotal, whatsappCartUrl } from "@/lib/cart";

const PAYMENT_OPTIONS = [
  { value: "transfer", label: "Transferencia bancaria" },
  { value: "cash", label: "Pago en efectivo (contra entrega)" },
  { value: "whatsapp", label: "Coordinar por WhatsApp" },
];

export default function CheckoutPage() {
  const { cart, flash } = usePage<{ cart: Cart | null; flash: PagePropsMessage["flash"] }>().props;
  const items: CartItem[] = cart?.cart_items ?? [];
  const totals = cartTotals(items);
  const [whatsappOnly, setWhatsappOnly] = useState(false);
  const [qtyPending, setQtyPending] = useState(false);
  const [mapQuery, setMapQuery] = useState("");

  const { data, setData, post, processing, errors } = useForm({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    notes: "",
    payment_method: "transfer",
  });

  useEffect(() => {
    const t = setTimeout(() => setMapQuery(data.customer_address), 600);
    return () => clearTimeout(t);
  }, [data.customer_address]);

  const changeQty = (item: CartItem, amount: number) => {
    if (qtyPending || amount < 1 || amount > 9999) return;
    setQtyPending(true);
    router.patch(`/shop/${item.product_id}`, { amount }, {
      preserveScroll: true,
      preserveState: true,
      onError: () => toast.error("No se pudo actualizar la cantidad. Inténtalo nuevamente."),
      onFinish: () => setQtyPending(false),
    });
  };

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
    if (whatsappOnly) {
      window.open(whatsappCartUrl(items), "_blank", "noopener,noreferrer");
      return;
    }
    post("/checkout", {
      preserveScroll: true,
      onError: () => toast.error("Revisa los datos del formulario."),
    });
  };

  return (
    <Layout>
      <Seo title="Checkout" description="Finaliza tu pedido en Smart House." />
      <main className="flex-1">
        <section className="bg-gradient-to-r from-[#006696] to-[#0088cc] text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Realizar pedido</h1>
            {flash?.status && <p className="mt-2 opacity-90">{flash.status}</p>}
          </div>
        </section>

        <section className="py-12 bg-white text-[#191c1f] [color-scheme:light]">
          <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={submit} className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold">Datos de entrega</h2>

              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium mb-1">
                  Nombre completo *
                </label>
                <input
                  id="customer_name"
                  type="text"
                  value={data.customer_name}
                  onChange={(e) => setData("customer_name", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  autoComplete="name"
                />
                {errors.customer_name && <p className="text-sm text-red-600 mt-1">{errors.customer_name}</p>}
              </div>

              <div>
                <label htmlFor="customer_phone" className="block text-sm font-medium mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  id="customer_phone"
                  type="tel"
                  value={data.customer_phone}
                  onChange={(e) => setData("customer_phone", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  autoComplete="tel"
                />
                {errors.customer_phone && <p className="text-sm text-red-600 mt-1">{errors.customer_phone}</p>}
              </div>

              <div>
                <label htmlFor="customer_email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="customer_email"
                  type="email"
                  value={data.customer_email}
                  onChange={(e) => setData("customer_email", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  autoComplete="email"
                />
                {errors.customer_email && <p className="text-sm text-red-600 mt-1">{errors.customer_email}</p>}
              </div>

              <div>
                <label htmlFor="customer_address" className="block text-sm font-medium mb-1">
                  Dirección de entrega
                </label>
                <input
                  id="customer_address"
                  type="text"
                  value={data.customer_address}
                  onChange={(e) => setData("customer_address", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  autoComplete="street-address"
                  placeholder="Escribe la dirección y el mapa la mostrará"
                />
                {errors.customer_address && (
                  <p className="text-sm text-red-600 mt-1">{errors.customer_address}</p>
                )}
                <div className="mt-2 overflow-hidden rounded-lg border border-gray-300">
                  <iframe
                    title="Mapa de ubicación de entrega"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery.trim() || "La Paz, Bolivia")}&output=embed`}
                    className="h-64 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Escribe la dirección en el campo y el mapa mostrará la ubicación de entrega.
                </p>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                  Notas
                </label>
                <textarea
                  id="notes"
                  value={data.notes}
                  onChange={(e) => setData("notes", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <fieldset>
                <legend className="text-sm font-medium mb-2">Forma de pago *</legend>
                {PAYMENT_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      name="payment_method"
                      value={opt.value}
                      checked={data.payment_method === opt.value}
                      onChange={() => setData("payment_method", opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
                {errors.payment_method && <p className="text-sm text-red-600">{errors.payment_method}</p>}
              </fieldset>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-[#fa8232] text-white font-semibold px-6 py-3 rounded-full disabled:opacity-60"
                >
                  {processing ? "Enviando…" : "Confirmar pedido"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWhatsappOnly(true);
                    window.open(whatsappCartUrl(items), "_blank", "noopener,noreferrer");
                  }}
                  className="border border-[#fa8232] text-[#fa8232] font-semibold px-6 py-3 rounded-full"
                >
                  Enviar solo por WhatsApp
                </button>
              </div>
            </form>

            <aside className="space-y-4">
              <h2 className="text-xl font-semibold">Resumen</h2>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3 bg-[#f2f4f5] rounded-xl p-3">
                    <div className="size-16 shrink-0">
                      <ResponsiveImg
                        alt={item.name}
                        className="size-full object-contain"
                        src={item.image_url}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.money} {Number(item.unit_price).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 my-1">
                        <button
                          type="button"
                          aria-label={`Disminuir cantidad de ${item.name}`}
                          disabled={qtyPending || item.amount <= 1}
                          onClick={() => changeQty(item, item.amount - 1)}
                          className="size-7 shrink-0 rounded-full bg-[#fa8232] text-white text-lg leading-none disabled:opacity-50"
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold">{item.amount}</span>
                        <button
                          type="button"
                          aria-label={`Aumentar cantidad de ${item.name}`}
                          disabled={qtyPending || item.amount >= 9999}
                          onClick={() => changeQty(item, item.amount + 1)}
                          className="size-7 shrink-0 rounded-full bg-[#fa8232] text-white text-lg leading-none disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm">
                        Subtotal: {item.money} {(itemSubtotal(item) / 100).toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {Object.entries(totals).map(([money, cents]) => (
                <div key={money} className="bg-[#f2f4f5] rounded-xl p-4 text-lg font-bold">
                  TOTAL A PAGAR: {money} {(cents / 100).toFixed(2)}
                </div>
              ))}
            </aside>
          </div>
        </section>
      </main>
    </Layout>
  );
}
