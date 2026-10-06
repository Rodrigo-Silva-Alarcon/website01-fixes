import { useCms } from "@/lib/cms";
import { MapPin, Globe, Clock, MessageCircle, Navigation } from "lucide-react";
import ResponsiveImg from "@/components/ResponsiveImg";
import type { HomeShowroomPhoto } from "@/types/models";

/** Fotos por defecto (las mismas que rellena la migración). */
const DEFAULT_PHOTOS: HomeShowroomPhoto[] = [
  { src: "/images/about-hero-smarthouse.jpg", webp: "/images/about-hero-smarthouse-480.webp", thumb: null, alt: "Showroom SmartHouse", mirror: false },
  { src: "/data/banners/025f7828-6a10-44a4-979c-35b0eaffacd4.jpg", webp: "/images/showroom-productos.webp", thumb: null, alt: "Productos SmartHouse", mirror: false },
  { src: "/images/about-hero-smarthouse.jpg", webp: "/images/about-hero-smarthouse-480.webp", thumb: null, alt: "Instalaciones SmartHouse", mirror: true },
];

interface Props {
  title?: string | null;
  subtitle?: string | null;
  photos?: HomeShowroomPhoto[];
}

export default function ShowroomSection({ title, subtitle, photos }: Props) {
  // Editables en Admin › Contacto (cada renglón de la dirección es una línea)
  const { addressLines, website, scheduleSummary: hours, mapsHref, whatsappIntl, whatsappHref } = useCms();

  return (
    <section
      id="tienda"
      className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-12 md:py-16 flex flex-col gap-7"
    >
      {/* Cabecera alineada con el resto de secciones */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#155eef]">
          {subtitle || "Nuestro showroom"}
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#191c1f]">
          {title || "Ven a conocer los productos en persona."}
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
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#fa8232] text-white text-base sm:text-lg font-bold hover:bg-[#f9751d]"
            >
              <MessageCircle className="size-5" />
              {whatsappIntl}
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

        {/* Columna Derecha: las fotos de la galería de Nosotros (editables en Admin › Nosotros) */}
        <div className="lg:col-span-5 grid grid-cols-4 gap-3">
          {(photos?.length ? photos : DEFAULT_PHOTOS).map((photo, idx) => (
            <div
              key={idx}
              className={`rounded-2xl overflow-hidden aspect-[3/5] bg-slate-100 ${idx === 1 || idx === 2 ? "shadow-md" : "shadow-sm"}`}
            >
              <ResponsiveImg
                src={photo.src}
                webpSrc={photo.webp}
                thumbWebpSrc={photo.thumb}
                sizes="(min-width: 1024px) 140px, 23vw"
                alt={photo.alt}
                style={photo.focus ? { objectPosition: photo.focus } : undefined}
                className={`w-full h-full object-cover ${photo.mirror ? "scale-x-[-1]" : ""}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
