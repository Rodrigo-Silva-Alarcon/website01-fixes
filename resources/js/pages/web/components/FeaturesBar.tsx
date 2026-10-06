import { Truck, ShieldCheck, CreditCard, Headphones } from "lucide-react";
import { useCms } from "@/lib/cms";
import type { HomeFeatureItem } from "@/types/models";

const ICONS = [Truck, ShieldCheck, CreditCard, Headphones];

/** Textos por defecto (los mismos que rellena la migración). */
const DEFAULTS: HomeFeatureItem[] = [
  { title: "Delivery seguro", subtitle: "Entrega a domicilio" },
  { title: "Garantía", subtitle: "Devolución del 100% del dinero" },
  { title: "Pago seguro", subtitle: "Tu dinero está protegido" },
  { title: "Atención personalizada", subtitle: null },
];

/** Títulos y textos editables en Admin › Página de inicio; el 4.º muestra el WhatsApp de Admin › Contacto. */
export default function FeaturesBar({ items }: { items?: HomeFeatureItem[] }) {
  const { whatsappIntl } = useCms();

  const features = DEFAULTS.map((fallback, idx) => ({
    icon: ICONS[idx],
    title: items?.[idx]?.title || fallback.title,
    desc: idx === 3 ? `WhatsApp ${whatsappIntl}` : items?.[idx]?.subtitle || fallback.subtitle,
  }));

  return (
    <section className="w-full border-y border-[#eceef0] bg-white mt-12 md:mt-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-3.5">
              <div className="size-11 shrink-0 rounded-full bg-[#eef3ff] text-[#155eef] flex items-center justify-center">
                <Icon className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[15px] text-[#191c1f]">
                  {item.title}
                </span>
                <span className="text-sm text-[#6b7076]">
                  {item.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
