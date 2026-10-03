import { useCms } from "@/lib/cms";
import { MapPin, Globe, Clock, MessageCircle, Navigation } from "lucide-react";

export default function ShowroomSection() {
  const { text, lines, whatsappLocal, whatsappHref } = useCms();

  // Editables en Admin › Textos (cada párrafo de la dirección es una línea)
  const addressLines = lines("showroom_address", ["Av. 20 de Octubre", "Esq. Rosendo Gutierrez", "Edif. Guadalquivir #2332"]);
  const website = text("site_url", "www.smarthousebo.com");
  const hours = text("business_hours", "Atención de lunes a sábado");

  const mapsHref =
    text("footer_maps") ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${addressLines.join(", ")} La Paz Bolivia`
    )}`;

  return (
    <section
      id="tienda"
      className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-12 md:py-16 flex flex-col gap-7"
    >
      {/* Cabecera alineada con el resto de secciones */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#155eef]">
          Nuestro showroom
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#191c1f]">
          Ven a conocer los productos en persona.
        </h2>
      </div>

      <div className="rounded-3xl border border-[#eceef0] p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white shadow-sm">
        {/* Columna Izquierda: Información de Showroom y Botones */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-col gap-4 text-base sm:text-lg font-medium text-[#3d4247]">
            {/* Dirección */}
            <div className="flex items-start gap-3.5">
              <div className="size-10 shrink-0 rounded-full bg-[#155eef] text-white flex items-center justify-center shadow-sm">
                <MapPin className="size-5" />
              </div>
              <div className="flex flex-col leading-snug">
                {addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </div>

            {/* Sitio Web */}
            <div className="flex items-center gap-3.5">
              <div className="size-10 shrink-0 rounded-full bg-[#155eef] text-white flex items-center justify-center shadow-sm">
                <Globe className="size-5" />
              </div>
              <span className="text-[#155eef] font-semibold">
                {website}
              </span>
            </div>

            {/* Horario */}
            <div className="flex items-center gap-3.5">
              <div className="size-10 shrink-0 rounded-full bg-[#155eef] text-white flex items-center justify-center shadow-sm">
                <Clock className="size-5" />
              </div>
              <span>{hours}</span>
            </div>
          </div>

          {/* Botones de Contacto */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#fa8232] text-white text-base sm:text-lg font-bold transition-all duration-200 hover:bg-[#f9751d] hover:-translate-y-0.5 shadow-md shadow-orange-500/25 active:translate-y-0"
            >
              <MessageCircle className="size-5" />
              {whatsappLocal}
            </a>

            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border-2 border-[#191c1f] text-[#191c1f] text-base font-semibold transition-all duration-200 hover:bg-[#191c1f] hover:text-white"
            >
              <Navigation className="size-5" />
              Cómo llegar
            </a>
          </div>
        </div>

        {/* Columna Derecha: Galería de Fotos del Showroom */}
        <div className="lg:col-span-5 grid grid-cols-3 gap-4">
          <div className="rounded-2xl overflow-hidden aspect-[3/5] bg-slate-100 shadow-sm">
            <img
              src="/images/about-hero-smarthouse.jpg"
              alt="Showroom SmartHouse"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="rounded-2xl overflow-hidden aspect-[3/5] bg-slate-100 shadow-md">
            <img
              src="/data/banners/025f7828-6a10-44a4-979c-35b0eaffacd4.jpg"
              alt="Productos SmartHouse"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/about-hero-smarthouse.jpg";
              }}
            />
          </div>

          <div className="rounded-2xl overflow-hidden aspect-[3/5] bg-slate-100 shadow-sm">
            <img
              src="/images/about-hero-smarthouse.jpg"
              alt="Instalaciones SmartHouse"
              className="w-full h-full object-cover scale-x-[-1]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
