import { useEffect, useState } from "react";
import { ArrowUpRight, Check, ChevronRight, Mail, MapPin, MessageCircle, Navigation, Send } from "lucide-react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import Layout from "./layouts/Layout";
import Seo from "@/components/Seo";
import { useCms } from "@/lib/cms";
import HeroCarousel from "@/pages/web/components/HeroCarousel";
import { BannerSlide } from "@/types/models";

type FieldKey = "name" | "phone" | "email" | "message";
type HoursRow = { d: string; h: string };

const inputClass =
  "w-full rounded-2xl border-[1.5px] border-[#dfe2e6] bg-white px-[18px] text-base text-[#191c1f] outline-none transition-[border-color,box-shadow] duration-[180ms] placeholder:text-[#8a8f94] focus:border-[#fa8232] focus:shadow-[0_0_0_4px_rgba(250,130,50,.15)]";

const pillOutline =
  "flex items-center gap-2 rounded-full border-[1.5px] border-[#fa8232] bg-white px-[22px] py-3.5 font-semibold text-[#c2410c] transition-colors duration-200 hover:bg-[#fa8232] hover:text-white";

const pillSolid =
  "flex items-center gap-2 rounded-full bg-[#fa8232] font-bold text-white transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:text-white hover:shadow-[0_10px_24px_rgba(250,130,50,.35)]";

/** Validación en el navegador con los mismos mensajes del diseño; el servidor vuelve a validar. */
function validate(data: Record<FieldKey, string>): Partial<Record<FieldKey, string>> {
  const err: Partial<Record<FieldKey, string>> = {};
  if (!data.name.trim()) err.name = "Ingresa tu nombre.";
  if (!data.phone.trim()) err.phone = "Ingresa tu teléfono.";
  if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) err.email = "Ingresa un email válido.";
  if (!data.message.trim()) err.message = "Escribe tu mensaje.";
  return err;
}

const DAYS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** "Lunes - Viernes" → [1..5], "Sábado" → [6], "Lunes, Miércoles" → [1, 3] */
function daysOf(label: string): number[] {
  const found = [...normalize(label).matchAll(/domingo|lunes|martes|miercoles|jueves|viernes|sabado/g)].map((m) => DAYS.indexOf(m[0]));
  if (found.length === 2 && /\s(-|–|a|al)\s/.test(normalize(label))) {
    const [from, to] = found;
    const range: number[] = [];
    for (let d = from; ; d = (d + 1) % 7) {
      range.push(d);
      if (d === to || range.length > 7) break;
    }
    return range;
  }
  return found;
}

/** "9:00 AM - 6:00 PM" → [9, 18]; "Cerrado" o texto sin horas → null */
function hoursOf(text: string): [number, number] | null {
  const times = [...text.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?)?/gi)].map((m) => {
    // sin AM/PM se toma como 24 h ("18:00")
    const h = m[3] ? (Number(m[1]) % 12) + (/p/i.test(m[3]) ? 12 : 0) : Number(m[1]);
    return h + Number(m[2] ?? 0) / 60;
  });
  return times.length >= 2 ? [times[0], times[1]] : null;
}

/**
 * Fila de hoy y si la tienda está abierta ahora, con la hora de La Paz.
 * open es null si el horario de hoy no indica horas (no se puede saber).
 */
function scheduleNow(rows: HoursRow[]): { today: number; open: boolean | null } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/La_Paz", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const hour = Number(get("hour")) + Number(get("minute")) / 60;

  const today = rows.findIndex((r) => daysOf(r.d).includes(day));
  if (today < 0) return { today, open: false };
  if (/cerrado/i.test(rows[today].h)) return { today, open: false };
  const span = hoursOf(rows[today].h);
  return { today, open: span ? hour >= span[0] && hour < span[1] : null };
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {error && <span role="alert" className="text-[13px] text-[#d9534f]">{error}</span>}
    </label>
  );
}

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
  const { banners = [] } = usePage<{ banners?: BannerSlide[] }>().props;
  const { text, lines, whatsappLocal, whatsappIntl, whatsappHref } = useCms();

  // Datos editables desde Admin › Textos
  const contactEmail = text("footer_email", "contacto@smarthouse.com.bo");
  const addressLines = lines("showroom_address");
  const contactAddress = addressLines.length
    ? addressLines.join(", ")
    : text("footer_address", "Av. 20 de Octubre esq. Rosendo Gutierrez, Edif. Guadalquivir #2332");
  const mapsHref =
    text("footer_maps") ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${contactAddress} La Paz Bolivia`)}`;
  const hours: HoursRow[] = lines("business_hours", [
    "Lunes - Viernes: 9:00 AM - 6:00 PM",
    "Sábado: 10:00 AM - 4:00 PM",
    "Domingo: Cerrado",
  ]).map((row) => {
    const i = row.indexOf(":");
    return i > 0 && i < row.length - 1 ? { d: row.slice(0, i).trim(), h: row.slice(i + 1).trim() } : { d: row, h: "" };
  });

  // "Abierto ahora" / "HOY" dependen de la hora actual: se calculan solo en el navegador
  const hoursKey = JSON.stringify(hours);
  const [schedule, setSchedule] = useState<{ today: number; open: boolean | null } | null>(null);
  useEffect(() => {
    const update = () => setSchedule(scheduleNow(hours));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoursKey]);

  const [sentTo, setSentTo] = useState<string | null>(null);
  const { data, setData, post, processing, errors, reset, clearErrors, setError } = useForm({
    name: "", email: "", phone: "", company: "", message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(data);
    if (Object.keys(err).length) {
      setError(err);
      return;
    }
    const firstName = data.name.trim().split(/\s+/)[0];
    post("/enviar", {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setSentTo(firstName);
        toast.success("El mensaje fue enviado exitosamente.");
      },
      onError: () => toast.error("Revisa los campos del formulario e inténtalo de nuevo."),
    });
  };

  const bind = (k: FieldKey) => ({
    id: k,
    name: k,
    value: data[k],
    "aria-invalid": errors[k] ? true : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setData(k, e.target.value);
      if (errors[k]) clearErrors(k);
    },
  });

  const orb = "absolute aspect-square rounded-full blur-[90px]";
  const openColor = schedule?.open ? "#c2410c" : "#6b7076";

  return (
    <Layout>
      <Seo
        title="Contáctanos"
        description="¿Tienes dudas o necesitas ayuda? Contáctanos y te responderemos pronto. Estamos aquí para ayudarte."
      />
      {/* Banners asignados a "Contáctanos" en el panel */}
      <HeroCarousel banners={banners} fallback={false} />

      <main className="flex flex-1 flex-col pb-[clamp(64px,8vw,96px)] font-dm_sans text-[#191c1f]">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[#eceef0]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
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
              Contáctanos
            </h1>
            <p className="m-0 max-w-[640px] text-[clamp(16px,1.3vw,19px)] leading-[1.65] text-[#3d4247] [text-wrap:pretty]">
              Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-1.5">
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className={`${pillSolid} px-[22px] py-3.5`}>
                <MessageCircle className="size-5" />
                {whatsappLocal}
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

        <section className="mx-auto flex w-full max-w-[1440px] flex-wrap items-start gap-[clamp(20px,3vw,40px)] px-[clamp(16px,4.4vw,64px)] pt-[clamp(40px,5vw,64px)]">
          {/* Formulario */}
          <div className="flex min-w-[min(100%,300px)] flex-[1_1_560px] flex-col gap-6 rounded-[28px] border border-[#eceef0] p-[clamp(24px,3.2vw,44px)]">
            {sentTo !== null ? (
              <div role="status" className="flex flex-col items-center gap-3.5 px-3 py-12 text-center">
                <span className="flex size-[72px] items-center justify-center rounded-full bg-[#fff4ec] text-[#fa8232]">
                  <Check className="size-8" />
                </span>
                <span className="text-2xl font-bold tracking-[-.02em]">¡Gracias{sentTo ? `, ${sentTo}` : ""}!</span>
                <span className="text-[15px] text-[#6b7076]">El mensaje fue enviado exitosamente.</span>
                <button
                  type="button"
                  onClick={() => setSentTo(null)}
                  className="mt-1 cursor-pointer rounded-full border-[1.5px] border-[#fa8232] bg-white px-[22px] py-3 text-[15px] font-semibold text-[#c2410c] transition-colors hover:bg-[#fff4ec]"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <h2 className="m-0 text-[clamp(26px,2.8vw,34px)] font-bold tracking-[-.03em]">Envíanos un mensaje</h2>
                  <p className="m-0 text-[15px] text-[#6b7076]">Los campos marcados con * son obligatorios.</p>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-[18px]">
                  <Field label="Nombre completo *" error={errors.name}>
                    <input type="text" autoComplete="name" placeholder="Tu nombre" className={`${inputClass} h-[52px]`} {...bind("name")} />
                  </Field>
                  <Field label="Teléfono / WhatsApp *" error={errors.phone}>
                    <input type="tel" autoComplete="tel" placeholder="Tu teléfono" className={`${inputClass} h-[52px]`} {...bind("phone")} />
                  </Field>
                </div>
                <Field label="Email *" error={errors.email}>
                  <input type="email" autoComplete="email" placeholder="tu@email.com" className={`${inputClass} h-[52px]`} {...bind("email")} />
                </Field>
                <Field label="Mensaje *" error={errors.message}>
                  <textarea rows={6} placeholder="Escribe tu mensaje aquí..." className={`${inputClass} resize-y py-3.5 leading-[1.55]`} {...bind("message")} />
                </Field>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={processing}
                    className={`${pillSolid} cursor-pointer px-[26px] py-[15px] text-base disabled:cursor-progress disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none`}
                  >
                    <Send className="size-5" />
                    {processing ? "Enviando..." : "Enviar mensaje"}
                  </button>
                  <span className="text-sm text-[#6b7076]">
                    ¿Prefieres hablar ahora?{" "}
                    <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#c2410c] hover:text-[#9a3412]">
                      Escríbenos por WhatsApp
                    </a>
                  </span>
                </div>
              </form>
            )}
          </div>

          {/* Lateral */}
          <aside className="flex min-w-[min(100%,300px)] flex-[1_1_340px] flex-col gap-4">
            <div className="flex flex-col rounded-[28px] border border-[#eceef0] p-2">
              <ChannelRow external href={whatsappHref()} icon={<MessageCircle className="size-6" />} label="WhatsApp" value={whatsappIntl} />
              <div className="mx-4 h-px bg-[#eceef0]" />
              <ChannelRow href={`mailto:${contactEmail}`} icon={<Mail className="size-6" />} label="Email" value={contactEmail} />
              <div className="mx-4 h-px bg-[#eceef0]" />
              <ChannelRow external small href={mapsHref} icon={<MapPin className="size-6" />} label="Showroom" value={contactAddress} />
            </div>

            <div className="flex flex-col gap-4 rounded-[28px] border border-[#fde3cf] bg-[#fff4ec] p-[clamp(20px,2.4vw,28px)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xl font-bold">Horario de atención</span>
                {schedule && schedule.open !== null && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-bold" style={{ color: openColor }}>
                    <span className="size-2 rounded-full" style={{ backgroundColor: openColor }} />
                    {schedule.open ? "Abierto ahora" : "Cerrado ahora"}
                  </span>
                )}
              </div>
              {hours.map((row, i) => (
                <div key={i} className="flex justify-between gap-3 border-b border-[#fde3cf] pb-3 text-[15px]">
                  <span className="flex items-center gap-2 text-[#3d4247]">
                    {row.d}
                    {schedule?.today === i && (
                      <span className="rounded-full bg-[#fa8232] px-2 py-0.5 text-[11px] font-bold tracking-[.04em] text-white">HOY</span>
                    )}
                  </span>
                  {row.h && (
                    <span className={`text-right font-semibold ${/cerrado/i.test(row.h) ? "text-[#c2410c]" : "text-[#191c1f]"}`}>{row.h}</span>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </section>
      </main>
    </Layout>
  );
}
