import { Brand } from "@/types/models";
import { Link, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import ResponsiveImg from "@/components/ResponsiveImg";

export default function MarcasLogos() {
  const { brands } = usePage<{ brands?: Brand[] }>().props;

  // Solo marcas activas; si no hay ninguna, la sección no se muestra
  const brandList = (brands ?? []).filter((brand) => brand.active);

  if (brandList.length === 0) return null;

  // Duplicar para efecto continuo infinito en el marquee (la animación avanza -50%)
  const marqueeItems = [...brandList, ...brandList];

  return (
    <section className="w-full pt-12 md:pt-16 flex flex-col gap-7 overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#fa8232]">Aliados</span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#191c1f]">
          Marcas con las que trabajamos
        </h2>
      </div>

      {/* Mismo ancho que "Productos populares" (contenido de 1440px con 64px a cada lado) */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
      <div className="w-full overflow-hidden border-y border-[#eceef0] py-8 sm:py-10 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        {/* pr-6 = separación final, para que el -50% del bucle quede exacto y no salte */}
        <div
          className="flex w-max items-center gap-6 pr-6 hover:[animation-play-state:paused]"
          style={{ animation: "sh-marquee 28s linear infinite" }}
        >
          {marqueeItems.map((brand, idx) => (
            // Caja idéntica para cada marca: el logo se centra dentro sin deformarse
            <div
              key={`${brand.id}-${idx}`}
              className="brand-logo flex items-center justify-center shrink-0 w-[200px] sm:w-[260px] h-24 sm:h-28 opacity-80 hover:opacity-100 transition-opacity"
            >
              {brand.image_url ? (
                <Link
                  href={route("brand", { brand: brand.id })}
                  className="flex items-center justify-center size-full [&_picture]:contents"
                >
                  <ResponsiveImg
                    alt={brand.name}
                    className="h-full w-full object-contain mix-blend-multiply"
                    src={brand.image_url}
                    webpSrc={brand.image_webp_url}
                  />
                </Link>
              ) : (
                <span className="text-2xl sm:text-4xl font-black tracking-wider text-[#191c1f]/80 select-none">
                  {brand.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}