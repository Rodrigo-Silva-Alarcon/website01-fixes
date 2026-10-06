import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronRight, Mail, MapPin, Navigation, Phone } from "lucide-react";
import WhatsAppIcon from "@/pages/web/components/WhatsAppIcon";
import { Link } from "@inertiajs/react";
import Layout from "./layouts/Layout";
import Seo from "@/components/Seo";
import { useCms } from "@/lib/cms";
import { groupSchedule, scheduleNow } from "@/lib/schedule";

const pillOutline =
  "flex items-center gap-2 rounded-full border-[1.5px] border-[#fa8232] bg-white px-[22px] py-3.5 font-semibold text-[#c2410c] transition-colors duration-200 hover:bg-[#fa8232] hover:text-white";

const pillSolid =
  "flex items-center gap-2 rounded-full bg-[#fa8232] font-bold text-white transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:text-white hover:shadow-[0_10px_24px_rgba(250,130,50,.35)]";

function ChannelRow({ href, icon, label, value, external, small }: {
  href: string; icon: React.ReactNode; label: string; value: string; external?: boolean; small?: boolean;
}) {
  return (
    <a
      href={href || undefined}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-4 rounded-[20px] p-4 text-[#191c1f] transition-colors duration-200 hover:bg-[#fff4ec] hover:text-[#191c1f]"
    >
      <span className="flex size-12 flex-none items-center justify-center rounded-2xl bg-[#fff4ec] text-[#c2410c]">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-xs font-semibold uppercase tracking-[.06em] text-[#6b7076]">{label}</span>
        <span className={`font-bold [overflow-wrap:anywhere] ${small ? "text-base leading-[1.35]" : "text-[17px]"}`}>{value}</span>
      </span>
      <ArrowUpRight className="size-5 flex-none text-[#c2410c]" />
    </a>
  );
}

export default function ContactoPage() {
  const { contact, email: contactEmail, phone, address: contactAddress, mapsHref, mapEmbedSrc, schedule: days, whatsappIntl, whatsappHref } = useCms();

  // Textos por sección editables en Admin › Contacto
  const t = {
    heroTitle: contact?.hero_title || "Contáctanos",
    heroSubtitle: contact?.hero_subtitle ?? "Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto.",
    hoursTitle: contact?.hours_title || "Horario de atención",
    hoursNote: contact?.hours_note ?? "",
  };
  const hours = groupSchedule(days);
  // El mapa del showroom se activa o desactiva en Admin › Contacto; sin él, el lateral queda centrado
  const showMap = contact?.show_map ?? true;

  // "Abierto ahora" / "HOY" dependen de la hora actual: se calculan solo en el navegador
  const hoursKey = JSON.stringify(days);
  const [schedule, setSchedule] = useState<{ today: number; open: boolean } | null>(null);
  useEffect(() => {
    const update = () => setSchedule(scheduleNow(days));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoursKey]);

  const orb = "absolute aspect-square rounded-full blur-[90px]";
  const openColor = schedule?.open ? "#c2410c" : "#6b7076";

  return (
    <Layout>
      <Seo
        title={t.heroTitle}
        description="¿Tienes dudas o necesitas ayuda? Contáctanos y te responderemos pronto. Estamos aquí para ayudarte."
      />
      <main className="flex flex-1 flex-col pb-[clamp(64px,8vw,96px)] font-dm_sans text-[#191c1f]">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_0%,#000_45%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_45%,transparent_100%)]"
          >
            <span className={`${orb} -top-[30%] left-[5%] w-[50vw] max-w-[640px] bg-[rgba(250,130,50,.26)]`} />
            <span className={`${orb} -top-[10%] right-0 w-[46vw] max-w-[600px] bg-[rgba(194,65,12,.16)]`} />
          </div>
          <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-[22px] px-[clamp(16px,4.4vw,64px)] pb-[clamp(40px,5vw,64px)] pt-[clamp(48px,7vw,96px)] text-center">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#6b7076]">
              <Link href="/" className="text-[#6b7076] hover:text-[#c2410c]">Inicio</Link>
              <ChevronRight className="size-4" />
              <span className="text-[#191c1f]">Contacto</span>
            </nav>
            <h1 className="m-0 max-w-[900px] text-[clamp(40px,6vw,84px)] font-bold leading-[.98] tracking-[-.04em] [text-wrap:balance]">
              {t.heroTitle}
            </h1>
            {t.heroSubtitle && (
              <p className="m-0 max-w-[640px] text-[clamp(16px,1.3vw,19px)] leading-[1.65] text-[#3d4247] [text-wrap:pretty]">
                {t.heroSubtitle}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-3 pt-1.5">
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className={`${pillSolid} px-[22px] py-3.5`}>
                <WhatsAppIcon className="size-5" />
                {whatsappIntl}
              </a>
              <a href={`mailto:${contactEmail}`} className={pillOutline}>
                <Mail className="size-5" />
                Correo
              </a>
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={pillOutline}>
                <Navigation className="size-5" />
                Cómo llegar
              </a>
            </div>
          </div>
        </section>

        <section
          className={`mx-auto flex w-full max-w-[1440px] flex-wrap gap-[clamp(20px,3vw,40px)] px-[clamp(16px,4.4vw,64px)] pt-[clamp(40px,5vw,64px)] ${showMap ? "items-stretch" : "justify-center"}`}
        >
          {/* Mapa del showroom */}
          {showMap && (
            <div className="flex min-h-[360px] min-w-[min(100%,300px)] flex-[1_1_560px] overflow-hidden rounded-[28px] border border-[#eceef0] bg-[#f4f5f6]">
              <iframe
                src={mapEmbedSrc}
                title={`Mapa del showroom: ${contactAddress}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block min-h-[360px] w-full flex-1 border-0"
              />
            </div>
          )}

          {/* Lateral */}
          <aside className={`flex min-w-[min(100%,300px)] flex-col gap-4 ${showMap ? "flex-[1_1_340px]" : "w-full max-w-[560px]"}`}>
            <div className="flex flex-col rounded-[28px] border border-[#eceef0] p-2">
              <ChannelRow external href={whatsappHref()} icon={<WhatsAppIcon className="size-6" />} label="WhatsApp" value={whatsappIntl} />
              <div className="mx-4 h-px bg-[#eceef0]" />
              {phone && (
                <>
                  <ChannelRow href={`tel:${phone.replace(/[^\d+]/g, "")}`} icon={<Phone className="size-6" />} label="Teléfono" value={phone} />
                  <div className="mx-4 h-px bg-[#eceef0]" />
                </>
              )}
              <ChannelRow href={`mailto:${contactEmail}`} icon={<Mail className="size-6" />} label="Email" value={contactEmail} />
              <div className="mx-4 h-px bg-[#eceef0]" />
              <ChannelRow external small href={mapsHref} icon={<MapPin className="size-6" />} label="Showroom" value={contactAddress} />
            </div>

            <div className="flex flex-col gap-4 rounded-[28px] border border-[#fde3cf] bg-[#fff4ec] p-[clamp(20px,2.4vw,28px)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xl font-bold">{t.hoursTitle}</span>
                {schedule && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-bold" style={{ color: openColor }}>
                    <span className="size-2 rounded-full" style={{ backgroundColor: openColor }} />
                    {schedule.open ? "Abierto ahora" : "Cerrado ahora"}
                  </span>
                )}
              </div>
              {hours.map((row) => (
                <div key={row.days.join("-")} className="flex justify-between gap-3 border-b border-[#fde3cf] pb-3 text-[15px]">
                  <span className="flex items-center gap-2 text-[#3d4247]">
                    {row.label}
                    {schedule && row.days.includes(schedule.today) && (
                      <span className="rounded-full bg-[#fa8232] px-2 py-0.5 text-[11px] font-bold tracking-[.04em] text-white">HOY</span>
                    )}
                  </span>
                  {row.closed ? (
                    <span className="text-right font-semibold text-[#c2410c]">Cerrado</span>
                  ) : (
                    <span className="flex flex-col text-right font-semibold tabular-nums text-[#191c1f]">
                      {row.hours.map((h) => (
                        <span key={h} className="whitespace-nowrap">{h}</span>
                      ))}
                    </span>
                  )}
                </div>
              ))}
              {t.hoursNote && <p className="m-0 text-sm leading-[1.5] text-[#6b7076]">{t.hoursNote}</p>}
            </div>
          </aside>
        </section>
      </main>
    </Layout>
  );
}
