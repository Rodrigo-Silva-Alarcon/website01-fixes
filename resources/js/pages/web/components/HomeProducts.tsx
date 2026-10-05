import { useRef } from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/models";
import ProductCard from "@/pages/web/components/ProductCard";
import Reveal from "@/pages/web/components/Reveal";

interface Props {
  title: string | null;
  products: Product[];
  /** Destino del botón "Ver más" (categoría u ofertas); sin él no se muestra. */
  link?: string | null;
}

/** Sección de productos del inicio (Admin › Página de inicio): título, fila deslizable y "Ver más". */
export default function HomeProducts({ title, products, link }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  // En escritorio caben 4 tarjetas: las flechas solo hacen falta si hay más
  const arrows = products.length > 4;

  const scroll = (direction: "left" | "right") => {
    if (!scrollerRef.current) return;
    // Avanza exactamente una tarjeta (ancho + separación de 16px)
    const card = scrollerRef.current.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth ?? 296) + 16;
    scrollerRef.current.scrollBy({ left: direction === "left" ? -step : step, behavior: "smooth" });
  };

  const arrowClass =
    "size-10 sm:size-11 rounded-full border border-[#dfe2e6] bg-white text-[#191c1f] flex items-center justify-center transition-colors hover:bg-[#191c1f] hover:border-[#191c1f] hover:text-white cursor-pointer";

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-12 md:pt-16 flex flex-col gap-5">
      <Reveal className="flex items-end justify-between gap-4 flex-wrap">
        {title && (
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#191c1f]">{title}</h2>
        )}
        <div className="flex items-center gap-2">
          {link && (
            <Link
              href={link}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-[#191c1f] text-sm font-semibold text-[#191c1f] transition-all duration-200 hover:bg-[#191c1f] hover:text-white"
            >
              Ver más
              <ArrowRight className="size-4" />
            </Link>
          )}
          {arrows && (
            <>
              <button type="button" onClick={() => scroll("left")} aria-label="Anterior" className={arrowClass}>
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" onClick={() => scroll("right")} aria-label="Siguiente" className={arrowClass}>
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>
      </Reveal>

      {/* En móvil y tablet se desliza; en escritorio caben 4 tarjetas.
          El -mx-2/px-2 deja 8px para que el borde de hover no se recorte. */}
      <Reveal y={24}>
        <div
          ref={scrollerRef}
          className="-mx-2 px-2 scroll-px-2 flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        >
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              className="w-[260px] sm:w-[296px] lg:w-[calc((100%-48px)/4)] shrink-0 snap-start"
            />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
