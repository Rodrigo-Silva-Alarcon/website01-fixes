import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  src: string;
  alt: string;
}

const SLIDES: Slide[] = [
  {
    src: "/images/hero/hero-1.webp",
    alt: "Smart House Importaciones SRL — WhatsApp 682-10861, Av. 20 de Octubre esq. Rosendo Gutiérrez, Edif. Guadalquivir #2332. Sony, Samsung y LG.",
  },
  {
    src: "/images/hero/hero-2.webp",
    alt: "Smart House — Delivery gratis, garantía oficial de marca. Consolas, audio y línea blanca.",
  },
];

const AUTOPLAY_MS = 15000;
const SWIPE_THRESHOLD = 50;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  // Cambia cada vez que el usuario navega, para reiniciar el temporizador de 15 s
  const [tick, setTick] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const goTo = useCallback((i: number) => {
    setIndex((i + SLIDES.length) % SLIDES.length);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, tick]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStartX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    setDragOffset(e.clientX - dragStartX.current);
  };

  const endDrag = () => {
    if (dragStartX.current === null) return;
    if (dragOffset <= -SWIPE_THRESHOLD) goTo(index + 1);
    else if (dragOffset >= SWIPE_THRESHOLD) goTo(index - 1);
    dragStartX.current = null;
    setDragOffset(0);
  };

  const dragging = dragOffset !== 0;

  return (
    <section
      data-screen-label="Hero"
      aria-roledescription="carrusel"
      className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-6 md:pt-8"
    >
      <div
        className="group relative overflow-hidden rounded-3xl bg-[#e7e7e7] aspect-[1899/702] select-none touch-pan-y cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") goTo(index - 1);
          if (e.key === "ArrowRight") goTo(index + 1);
        }}
        tabIndex={0}
      >
        <div
          className={`flex h-full ${dragging ? "" : "transition-transform duration-700 ease-out"}`}
          style={{ transform: `translateX(calc(${-index * 100}% + ${dragOffset}px))` }}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={slide.src}
              className="w-full h-full shrink-0"
              aria-hidden={i !== index}
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${SLIDES.length}`}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                draggable={false}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          ))}
        </div>

        {/* Flechas */}
        <button
          type="button"
          aria-label="Imagen anterior"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => goTo(index - 1)}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 size-9 sm:size-11 rounded-full bg-white/85 text-[#191c1f] shadow-md flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-[#fa8232] hover:text-white cursor-pointer"
        >
          <ChevronLeft className="size-5 sm:size-6" />
        </button>
        <button
          type="button"
          aria-label="Imagen siguiente"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => goTo(index + 1)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 size-9 sm:size-11 rounded-full bg-white/85 text-[#191c1f] shadow-md flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-[#fa8232] hover:text-white cursor-pointer"
        >
          <ChevronRight className="size-5 sm:size-6" />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir a la imagen ${i + 1}`}
              aria-current={i === index}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all cursor-pointer shadow ${
                i === index ? "w-8 bg-[#fa8232]" : "w-2.5 bg-white/80 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
