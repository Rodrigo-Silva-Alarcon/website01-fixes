import { Truck, ShieldCheck, CreditCard, Headphones } from "lucide-react";
import { usePage } from "@inertiajs/react";

export default function FeaturesBar() {
  const { cmsTexts } = usePage<{ cmsTexts?: Record<string, string> }>().props;
  const whatsappNum = cmsTexts?.footer_whatsapp || "WhatsApp 682-10861";

  const features = [
    {
      icon: Truck,
      title: "Delivery gratuito",
      desc: "Entrega en 24 h",
    },
    {
      icon: ShieldCheck,
      title: "Garantía",
      desc: "Devolución del 100% del dinero",
    },
    {
      icon: CreditCard,
      title: "Pago seguro",
      desc: "Tu dinero está protegido",
    },
    {
      icon: Headphones,
      title: "Atención personalizada",
      desc: whatsappNum.startsWith("WhatsApp") ? whatsappNum : `WhatsApp ${whatsappNum}`,
    },
  ];

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
