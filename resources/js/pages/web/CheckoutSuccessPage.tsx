import { Link, usePage } from "@inertiajs/react";
import Layout from "./layouts/Layout";
import Seo from "@/components/Seo";
import { Order } from "@/types/models";
import { PagePropsMessage } from "@/types/models";

const PAYMENT_LABELS: Record<string, string> = {
  transfer: "Transferencia bancaria",
  cash: "Efectivo (contra entrega)",
  whatsapp: "Coordinar por WhatsApp",
};

export default function CheckoutSuccessPage() {
  const { order, flash } = usePage<{ order: Order | null; flash: PagePropsMessage["flash"] }>().props;

  if (!order) {
    return (
      <Layout>
        <Seo title="Pedido" description="Estado de tu pedido." />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">Pedido no encontrado.</main>
      </Layout>
    );
  }

  const waText = encodeURIComponent(
    `Hola, registré el pedido #${order.id} por ${order.total} Bs. Nombre: ${order.customer_name}. Tel: ${order.customer_phone}.`,
  );

  return (
    <Layout>
      <Seo title="Pedido confirmado" description="Tu pedido fue registrado." />
      <main className="flex-1">
        <section className="bg-gradient-to-r from-[#006696] to-[#0088cc] text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">¡Pedido registrado!</h1>
            {flash?.status && <p className="mt-2 opacity-90">{flash.status}</p>}
          </div>
        </section>

        <section className="py-16 bg-white text-[#191c1f] [color-scheme:light]">
          <div className="container mx-auto px-4 max-w-2xl bg-[#f2f4f5] rounded-2xl p-8 space-y-4">
            <p>
              Número de pedido: <strong>#{order.id}</strong>
            </p>
            <p>
              Estado: <strong>{order.status}</strong>
            </p>
            <p>
              Total: <strong>Bs. {Number(order.total).toFixed(2)}</strong>
            </p>
            <p>
              Forma de pago: <strong>{PAYMENT_LABELS[order.payment_method ?? ""] ?? order.payment_method}</strong>
            </p>
            <p>
              Cliente: {order.customer_name} · {order.customer_phone}
            </p>

            {(order.order_items ?? []).length > 0 && (
              <div className="border-t border-[#d7dade] pt-4">
                <h2 className="font-semibold mb-3">Productos del pedido</h2>
                <ul className="space-y-2 text-sm">
                  {order.order_items!.map((item) => (
                    <li key={item.id} className="flex justify-between gap-4">
                      <span>
                        {item.name} <span className="text-[#5f6c72]">× {item.quantity}</span>
                      </span>
                      <span className="font-medium">Bs. {Number(item.amount).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-4">
              <a
                href={`https://wa.me/59168210861?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#fa8232] text-white font-semibold px-6 py-3 rounded-full"
              >
                Confirmar por WhatsApp
              </a>
              <Link href="/" className="border border-[#191c1f] px-6 py-3 rounded-full font-semibold">
                Volver al inicio
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
