import { useRef } from "react";
import { Product } from "@/types/models";
import { usePage } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/pages/web/components/ProductCard";

export default function Ofertas() {
  const { populares } = usePage<{ populares: Product[] }>().props;
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!populares || populares.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollerRef.current) return;
    // Avanza exactamente una tarjeta (ancho + separación de 16px)
    const card = scrollerRef.current.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth ?? 296) + 16;
    const amount = direction === "left" ? -step : step;
    scrollerRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="w-full max-w-[1440px] mx-auto pt-12 md:pt-16 flex flex-col gap-5">
      {/* Cabecera de la sección con Flechas de Navegación */}
      <div className="flex items-end justify-between gap-4 px-4 sm:px-8 lg:px-16 flex-wrap">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#191c1f]">
          Productos populares
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Anterior"
            className="size-10 sm:size-11 rounded-full border border-[#dfe2e6] bg-white text-[#191c1f] flex items-center justify-center transition-colors hover:bg-[#191c1f] hover:border-[#191c1f] hover:text-white cursor-pointer"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Siguiente"
            className="size-10 sm:size-11 rounded-full border border-[#dfe2e6] bg-white text-[#191c1f] flex items-center justify-center transition-colors hover:bg-[#191c1f] hover:border-[#191c1f] hover:text-white cursor-pointer"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Contenedor Carrusel Desplazable: mismo ancho que los bloques por categoría.
          El -mx-2/px-2 deja 8px para que el borde de hover no se recorte. */}
      <div className="px-4 sm:px-8 lg:px-16">
        <div
          ref={scrollerRef}
          className="-mx-2 px-2 scroll-px-2 flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        >
          {populares.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              className="w-[260px] sm:w-[296px] lg:w-[calc((100%-48px)/4)] shrink-0 snap-start"
            />
          ))}
        </div>
      </div>
    </section>
  );
}