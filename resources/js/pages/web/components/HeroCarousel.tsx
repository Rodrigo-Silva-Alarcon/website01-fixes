import { useCallback, useEffect, useRef, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BannerSlide } from "@/types/models";

interface Slide {
  key: string;
  src: string;
  webp?: string | null;
  /** WebP en varios anchos ("md 800w, completa NNNw"). */
  srcset?: string | null;
  alt: string;
  title?: string | null;
  summary?: string | null;
  link?: string | null;
  external?: boolean;
}

/** Se muestran solo si el panel no tiene banners activos para la página. */
const FALLBACK_SLIDES: Slide[] = [
  {
    key: "fallback-1",
    src: "/images/hero/hero-1.webp",
    alt: "Smart House Importaciones SRL — WhatsApp 682-10861, Av. 20 de Octubre esq. Rosendo Gutiérrez, Edif. Guadalquivir #2332. Sony, Samsung y LG.",
  },
  {
    key: "fallback-2",
    src: "/images/hero/hero-2.webp",
    alt: "Smart House — Delivery gratis, garantía oficial de marca. Consolas, audio y línea blanca.",
  },
];

/** Ancho real del banner: la sección es de máx. 1440px con px-4 / sm:px-8 / lg:px-16. */
const HERO_SIZES =
  "(min-width: 1440px) 1312px, (min-width: 1024px) calc(100vw - 128px), (min-width: 640px) calc(100vw - 64px), calc(100vw - 32px)";

const AUTOPLAY_MS = 15000;
const SWIPE_THRESHOLD = 50;
/** Movimiento mínimo (px) para considerar que es arrastre y no clic. */
const DRAG_START = 6;

function toSlides(banners: BannerSlide[]): Slide[] {
  return banners.map((b) => ({
    key: `banner-${b.id}`,
    src: b.image_url,
    webp: b.image_webp_url,
    srcset: b.image_srcset,
    alt: b.summary ? `${b.name} — ${b.summary}` : b.name,
    title: b.sw_title ? b.name : null,
    summary: b.sw_title ? b.summary : null,
    link: b.link,
    external: b.external,
  }));
}

interface HeroCarouselProps {
  /** Banners activos del panel para esta página. */
  banners?: BannerSlide[];
  /** Si no hay banners: true muestra las imágenes por defecto, false no renderiza nada. */
  fallback?: boolean;
}

export default function HeroCarousel({ banners = [], fallback = true }: HeroCarouselProps) {
  const slides = banners.length > 0 ? toSlides(banners) : fallback ? FALLBACK_SLIDES : [];
  const count = slides.length;

  const [index, setIndex] = useState(0);
  // Cambia cada vez que el usuario navega, para reiniciar el temporizador de 15 s
  const [tick, setTick] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const dragged = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  const current = count > 0 ? index % count : 0;

  const goTo = useCallback(
    (i: number) => {
      if (count === 0) return;
      setIndex((i + count) % count);
      setTick((t) => t + 1);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, tick, count]);

  if (count === 0) return null;

  const multiple = count > 1;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!multiple || (e.pointerType === "mouse" && e.button !== 0)) return;
    dragStartX.current = e.clientX;
    dragged.current = false;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    // La captura se activa solo al arrastrar, así un clic simple sigue abriendo el enlace del banner
    if (!dragged.current && Math.abs(dx) >= DRAG_START) {
      dragged.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (dragged.current) setDragOffset(dx);
  };

  const endDrag = () => {
    if (dragStartX.current === null) return;
    if (dragOffset <= -SWIPE_THRESHOLD) goTo(current + 1);
    else if (dragOffset >= SWIPE_THRESHOLD) goTo(current - 1);
    dragStartX.current = null;
    setDragOffset(0);
  };

  // Evita que soltar un arrastre encima del banner dispare su enlace
  const onClickCapture = (e: React.MouseEvent) => {
    if (dragged.current) {
      e.preventDefault();
      e.stopPropagation();
      dragged.current = false;
    }
  };

  const dragging = dragOffset !== 0;
  const lcp = slides[0];
  const lcpSrcSet = lcp.srcset ?? lcp.webp;

  return (
    <section
      data-screen-label="Hero"
      aria-roledescription="carrusel"
      className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-6 md:pt-8"
    >
      {/* La primera imagen es el LCP: con SSR este preload va en el <head>, antes del JSON de la página,
          y el navegador la pide sin esperar a leer todo el HTML. */}
      <Head>
        {lcpSrcSet ? (
          <link
            head-key="hero-lcp"
            rel="preload"
            as="image"
            type="image/webp"
            imageSrcSet={lcpSrcSet}
            imageSizes={lcp.srcset ? HERO_SIZES : undefined}
            fetchPriority="high"
          />
        ) : (
          <link head-key="hero-lcp" rel="preload" as="image" href={lcp.src} fetchPriority="high" />
        )}
      </Head>
      <div
        className={`group relative overflow-hidden rounded-3xl bg-[#e7e7e7] aspect-[1899/702] select-none touch-pan-y ${multiple ? "cursor-grab active:cursor-grabbing" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") goTo(current - 1);
          if (e.key === "ArrowRight") goTo(current + 1);
        }}
        tabIndex={multiple ? 0 : undefined}
      >
        <div
          className={`flex h-full ${dragging ? "" : "transition-transform duration-700 ease-out"}`}
          style={{ transform: `translateX(calc(${-current * 100}% + ${dragOffset}px))` }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.key}
              className="relative w-full h-full shrink-0"
              aria-hidden={i !== current}
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${count}`}
            >
              <SlideBody slide={slide} eager={i === 0} focusable={i === current} />
            </div>
          ))}
        </div>

        {multiple && (
          <>
            {/* Flechas */}
            <button
              type="button"
              aria-label="Imagen anterior"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => goTo(current - 1)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 size-9 sm:size-11 rounded-full bg-white/85 text-[#191c1f] shadow-md hidden sm:flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-[#fa8232] hover:text-white cursor-pointer"
            >
              <ChevronLeft className="size-5 sm:size-6" />
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => goTo(current + 1)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 size-9 sm:size-11 rounded-full bg-white/85 text-[#191c1f] shadow-md hidden sm:flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-[#fa8232] hover:text-white cursor-pointer"
            >
              <ChevronRight className="size-5 sm:size-6" />
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-0.5 sm:bottom-2.5 left-1/2 -translate-x-1/2 flex">
              {slides.map((slide, i) => (
                // Área táctil de 24px; el punto visible sigue siendo el <span> de dentro
                <button
                  key={slide.key}
                  type="button"
                  aria-label={`Ir a la imagen ${i + 1}`}
                  aria-current={i === current}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => goTo(i)}
                  className="group/dot flex h-6 min-w-6 items-center justify-center cursor-pointer"
                >
                  <span
                    className={`block h-2.5 rounded-full transition-all shadow ${
                      i === current ? "w-8 bg-[#fa8232]" : "w-2.5 bg-white/80 group-hover/dot:bg-white"
                    }`}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function SlideBody({ slide, eager, focusable }: { slide: Slide; eager: boolean; focusable: boolean }) {
  const img = (
    <picture className="contents">
      {(slide.srcset || slide.webp) && (
        <source srcSet={slide.srcset ?? slide.webp ?? undefined} sizes={slide.srcset ? HERO_SIZES : undefined} type="image/webp" />
      )}
      <img
        src={slide.src}
        alt={slide.alt}
        draggable={false}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className="w-full h-full object-cover pointer-events-none"
      />
    </picture>
  );

  // Título/descripción solo si el banner tiene activado "mostrar título" en el panel
  const caption = slide.title && (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent px-5 pb-8 pt-16 sm:px-10 sm:pb-12">
      <p className="max-w-[640px] text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white line-clamp-2">
        {slide.title}
      </p>
      {slide.summary && (
        <p className="mt-1.5 max-w-[640px] text-sm sm:text-base text-white/90 line-clamp-2">{slide.summary}</p>
      )}
    </div>
  );

  const tabIndex = focusable ? undefined : -1;
  const className = "block size-full";

  if (slide.link && slide.external) {
    return (
      <a href={slide.link} target="_blank" rel="noopener noreferrer" className={className} draggable={false} tabIndex={tabIndex}>
        {img}
        {caption}
      </a>
    );
  }
  if (slide.link) {
    return (
      <Link href={slide.link} className={className} draggable={false} tabIndex={tabIndex}>
        {img}
        {caption}
      </Link>
    );
  }
  return (
    <>
      {img}
      {caption}
    </>
  );
}
