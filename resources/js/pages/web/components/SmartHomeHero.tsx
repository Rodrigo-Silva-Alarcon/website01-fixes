import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Category } from "@/types/models";
import { Sparkles, ArrowRight, Tv, Gamepad2, Headphones, Refrigerator, Smartphone, ChefHat } from "lucide-react";

interface SmartHomeHeroProps {
  categorias?: Category[];
}

interface SpotConfig {
  id: string;
  name: string;
  defaultSlug: string;
  pos: [number, number]; // [x, y] in 600x560 space
  percentPos: { left: string; top: string };
  icon: typeof Tv;
  fallbackImage: string;
}

const SPOTS_CONFIG: SpotConfig[] = [
  {
    id: "consolas",
    name: "Consolas",
    defaultSlug: "consolas",
    pos: [300, 140],
    percentPos: { left: "50%", top: "25%" },
    icon: Gamepad2,
    fallbackImage: "/data/categories/consolas.png",
  },
  {
    id: "tv",
    name: "Televisores",
    defaultSlug: "televisores",
    pos: [140, 282],
    percentPos: { left: "23.33%", top: "50.36%" },
    icon: Tv,
    fallbackImage: "/data/categories/televisores.png",
  },
  {
    id: "audio",
    name: "Equipos de audio",
    defaultSlug: "equipos-de-sonido",
    pos: [460, 282],
    percentPos: { left: "76.67%", top: "50.36%" },
    icon: Headphones,
    fallbackImage: "/data/categories/audio.png",
  },
  {
    id: "cocina",
    name: "Cocina",
    defaultSlug: "cocina",
    pos: [150, 455],
    percentPos: { left: "25%", top: "81.25%" },
    icon: ChefHat,
    fallbackImage: "/data/categories/cocina.png",
  },
  {
    id: "cel",
    name: "Celulares",
    defaultSlug: "celulares",
    pos: [300, 455],
    percentPos: { left: "50%", top: "81.25%" },
    icon: Smartphone,
    fallbackImage: "/data/categories/celulares.png",
  },
  {
    id: "electro",
    name: "Electrodomésticos",
    defaultSlug: "electrodomesticos",
    pos: [450, 455],
    percentPos: { left: "75%", top: "81.25%" },
    icon: Refrigerator,
    fallbackImage: "/data/categories/electrodomesticos.png",
  },
];

export default function SmartHomeHero({ categorias = [] }: SmartHomeHeroProps) {
  const [activeSpot, setActiveSpot] = useState<string>("electro");
  const [isHovering, setIsHovering] = useState<boolean>(false);

  // Auto-ciclo de hotspots cada 2.6 segundos si no se está interactuando
  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setActiveSpot((prev) => {
        const idx = SPOTS_CONFIG.findIndex((s) => s.id === prev);
        const nextIdx = (idx + 1) % SPOTS_CONFIG.length;
        return SPOTS_CONFIG[nextIdx].id;
      });
    }, 2600);
    return () => clearInterval(interval);
  }, [isHovering]);

  // Asociar categorías reales del backend con los puntos de la casa
  const spots = SPOTS_CONFIG.map((cfg) => {
    const matchedCategory = categorias.find((c) => {
      const slug = c.slug.toLowerCase();
      const name = c.name.toLowerCase();
      if (cfg.id === "consolas") return slug.includes("consola") || name.includes("consola");
      if (cfg.id === "tv") return slug.includes("tele") || slug.includes("tv") || name.includes("tele");
      if (cfg.id === "audio") return slug.includes("audio") || slug.includes("sonido") || name.includes("audio");
      if (cfg.id === "cocina") return slug.includes("cocina") || name.includes("cocina");
      if (cfg.id === "cel") return slug.includes("cel") || slug.includes("movil") || name.includes("celular");
      if (cfg.id === "electro") return slug.includes("electro") || name.includes("electro");
      return false;
    });

    const categoryName = matchedCategory ? matchedCategory.name : cfg.name;
    const categorySlug = matchedCategory ? matchedCategory.slug : cfg.defaultSlug;
    const categoryImage =
      matchedCategory?.image_url ||
      matchedCategory?.image_thumbs_url ||
      matchedCategory?.image ||
      cfg.fallbackImage;

    const href = route("category", { category: categorySlug });
    const isActive = activeSpot === cfg.id;

    return {
      ...cfg,
      categoryName,
      categorySlug,
      categoryImage,
      href,
      isActive,
    };
  });

  const hub: [number, number] = [300, 305];
  const housePath = "M300 20 L30 247 V540 H570 V247 Z";

  return (
    <section
      data-screen-label="Hero"
      className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-8 md:py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
    >
      {/* Columna Izquierda: Copywriting y Llamados a la Acción */}
      <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6 max-w-xl">
        {/* Badge superior con pulso en vivo */}
        <div className="self-start inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#eef3ff] text-[#155eef] text-xs sm:text-sm font-semibold tracking-wide">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#155eef] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#155eef]"></span>
          </span>
          Tecnología y electrodomésticos
        </div>

        {/* Titular Principal */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#191c1f] leading-[1.08]">
          Tu hogar, más <span className="text-[#fa8232]">inteligente</span>.
        </h1>

        {/* Subtítulo */}
        <p className="text-base sm:text-lg text-[#5b6066] leading-relaxed">
          Televisores, cocina, audio, electrodomésticos, celulares y consolas de marcas líderes, con delivery seguro.
        </p>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href={route("products")}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#fa8232] text-white text-base font-semibold transition-all duration-200 hover:bg-[#f9751d] hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0"
          >
            Explorar tienda
            <ArrowRight className="size-5" />
          </Link>

          <Link
            href={route("products", { offers: 1 })}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border-2 border-[#191c1f] text-[#191c1f] text-base font-semibold transition-all duration-200 hover:bg-[#191c1f] hover:text-white"
          >
            <Sparkles className="size-4 text-[#fa8232] fill-[#fa8232]" />
            Ver ofertas
          </Link>
        </div>

        {/* Píldoras / Filtros rápidos de Categorías */}
        <div className="flex flex-wrap gap-2 pt-3">
          {spots.map((spot) => {
            const Icon = spot.icon;
            const active = spot.isActive;
            return (
              <button
                key={spot.id}
                type="button"
                onMouseEnter={() => {
                  setActiveSpot(spot.id);
                  setIsHovering(true);
                }}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => setActiveSpot(spot.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border cursor-pointer ${
                  active
                    ? "bg-[#fff4ec] border-[#fa8232] text-[#c2410c] shadow-sm ring-1 ring-[#fa8232]"
                    : "bg-white border-[#e3e6ea] text-[#3d4247] hover:border-[#fa8232] hover:bg-[#fff9f5]"
                }`}
              >
                <Icon className={`size-4 ${active ? "text-[#fa8232]" : "text-[#155eef]"}`} />
                {spot.categoryName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Columna Derecha: Casa Interactiva SmartHouse */}
      <div
        className="lg:col-span-6 relative w-full max-w-[620px] mx-auto aspect-[600/560] select-none"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* SVG de Silueta, Resplandores y Rutas Animadas */}
        <svg
          viewBox="0 0 600 560"
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        >
          <defs>
            <clipPath id="shHeroHouseClip">
              <path d={housePath} />
            </clipPath>
            <filter id="shHeroBlend" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="46" />
            </filter>
          </defs>

          {/* Resplandores internos fluidos con la forma de la casa */}
          <g clipPath="url(#shHeroHouseClip)">
            <rect x="0" y="0" width="600" height="560" fill="#ffffff" />
            <g filter="url(#shHeroBlend)">
              <circle cx="150" cy="330" r="210" fill="#fa8232" fillOpacity="0.38">
                <animate
                  attributeName="cx"
                  values="150;270;110;150"
                  dur="11s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"
                />
                <animate
                  attributeName="cy"
                  values="330;260;420;330"
                  dur="11s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"
                />
              </circle>
              <circle cx="450" cy="330" r="220" fill="#155eef" fillOpacity="0.30">
                <animate
                  attributeName="cx"
                  values="450;330;480;450"
                  dur="13s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"
                />
                <animate
                  attributeName="cy"
                  values="330;420;250;330"
                  dur="13s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"
                />
              </circle>
              <circle cx="420" cy="180" r="120" fill="#fa8232" fillOpacity="0.25">
                <animate
                  attributeName="cx"
                  values="420;300;470;420"
                  dur="9s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"
                />
                <animate
                  attributeName="cy"
                  values="180;240;150;180"
                  dur="9s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"
                />
              </circle>
              <circle cx="190" cy="470" r="130" fill="#155eef" fillOpacity="0.25">
                <animate
                  attributeName="cx"
                  values="190;300;140;190"
                  dur="10s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"
                />
                <animate
                  attributeName="cy"
                  values="470;400;500;470"
                  dur="10s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"
                />
              </circle>
            </g>
          </g>

          {/* Línea de contorno de la casa */}
          <path
            d={housePath}
            fill="none"
            stroke="#191c1f"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Línea de suelo */}
          <line x1="0" y1="540" x2="600" y2="540" stroke="#191c1f" strokeWidth="2.5" strokeLinecap="round" />

          {/* Rutas curvas desde el Hub hacia cada nodo */}
          {spots.map((spot, i) => {
            const [x, y] = spot.pos;
            const on = spot.isActive;
            const bend = x < 300 ? -18 : x > 300 ? 18 : 0;
            const d = `M${hub[0]} ${hub[1]} Q ${(hub[0] + x) / 2 + bend} ${
              (hub[1] + y) / 2 - (Math.abs(y - hub[1]) < 40 ? 26 : 10)
            } ${x} ${y}`;

            return (
              <g key={spot.id}>
                {/* Línea punteada que vibra/fluye */}
                <path
                  d={d}
                  fill="none"
                  stroke={on ? "#fa8232" : "#155eef"}
                  strokeOpacity={on ? 1 : 0.45}
                  strokeWidth={on ? 2.5 : 1.5}
                  strokeDasharray="5 7"
                  strokeLinecap="round"
                  className="transition-colors duration-300"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="24"
                    to="0"
                    dur={on ? "0.6s" : "1.6s"}
                    repeatCount="indefinite"
                  />
                </path>
                {/* Pulso de luz viajando sobre la línea */}
                <circle r={on ? 5 : 3.5} fill={on ? "#fa8232" : "#155eef"}>
                  <animateMotion
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin={`${-i * 0.4}s`}
                    path={d}
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Hub Central (SmartHouse Brand Core) */}
        <div className="absolute left-1/2 top-[54.46%] -translate-x-1/2 -translate-y-1/2 w-[16%] aspect-square flex items-center justify-center pointer-events-none">
          {/* Anillos de respiración/ondas */}
          <span
            className="absolute -inset-1 rounded-full border-2 border-[#155eef] pointer-events-none"
            style={{ animation: "sh-breathe 2.8s ease-out infinite" }}
          />
          <span
            className="absolute -inset-1 rounded-full border-2 border-[#155eef] pointer-events-none"
            style={{ animation: "sh-breathe 2.8s ease-out 1.4s infinite" }}
          />

          {/* Insignia Central */}
          <div className="relative w-full h-full rounded-full bg-white border-2 border-[#191c1f] flex items-center justify-center shadow-xl shadow-blue-500/20">
            <svg viewBox="0 0 48 48" className="w-3/5 h-3/5" fill="none">
              <path d="M24 4 3 21.5V44h42V21.5L24 4Z" fill="#fa8232" />
              <path
                d="M18 28.6 24 35.5 30 28.6"
                stroke="#155eef"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="18" cy="27.5" r="2.8" fill="#155eef" />
              <circle cx="30" cy="27.5" r="2.8" fill="#155eef" />
              <circle cx="24" cy="36.2" r="2.8" fill="#155eef" />
              <rect x="21.5" y="39" width="5" height="5" rx="0.6" fill="#191c1f" />
            </svg>
          </div>
        </div>

        {/* Puntos de Acceso / Habitaciones (Hotspot Bubbles) */}
        {spots.map((spot) => {
          const Icon = spot.icon;
          const on = spot.isActive;
          return (
            <Link
              key={spot.id}
              href={spot.href}
              onMouseEnter={() => {
                setActiveSpot(spot.id);
                setIsHovering(true);
              }}
              onMouseLeave={() => setIsHovering(false)}
              style={{
                left: spot.percentPos.left,
                top: spot.percentPos.top,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-[18%] transition-all duration-300 ease-out group ${
                on ? "scale-110 z-20" : "scale-100 z-10 hover:scale-105"
              }`}
            >
              {/* Burbuja Circular con Imagen o Icono */}
              <div
                className={`relative w-full aspect-square rounded-full bg-white overflow-hidden transition-all duration-300 flex items-center justify-center ${
                  on
                    ? "border-2 border-[#fa8232] shadow-xl shadow-orange-500/35 ring-4 ring-orange-500/15"
                    : "border-2 border-white shadow-md hover:border-[#155eef] hover:shadow-lg"
                }`}
              >
                {spot.categoryImage ? (
                  <img
                    loading="lazy"
                    decoding="async"
                    src={spot.categoryImage}
                    alt={spot.categoryName}
                    className="w-full h-full object-cover p-2.5 transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      // Fallback a icono si la imagen no carga
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
                <Icon
                  className={`size-7 text-[#155eef] transition-colors ${
                    on ? "text-[#fa8232]" : "text-[#155eef]"
                  }`}
                />
              </div>

              {/* Etiqueta Flotante con el Nombre de la Categoría */}
              <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 shadow-sm ${
                    on
                      ? "bg-[#191c1f] text-white ring-1 ring-[#191c1f]"
                      : "bg-white text-[#191c1f] border border-[#e3e6ea] group-hover:border-[#fa8232]"
                  }`}
                >
                  {spot.categoryName}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
