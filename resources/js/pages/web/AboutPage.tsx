import { useEffect, useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import { CreditCard, Headphones, MessageCircle, Navigation, Package, Trophy, type LucideIcon } from "lucide-react";
import Layout from "@/pages/web/layouts/Layout";
import Seo from "@/components/Seo";
import { useCms } from "@/lib/cms";
import HeroCarousel from "@/pages/web/components/HeroCarousel";
import { BannerSlide } from "@/types/models";

/** Contenido editable desde Admin › Nosotros (null antes de migrar: se usan los valores por defecto). */
type AboutGalleryImage = { position: number; webp: string; src: string; alt: string; focus: string };
type AboutContent = {
  title: string;
  title_highlight: string | null;
  intro: string;
  mission_title: string;
  mission: string;
  vision_title: string;
  vision: string;
  gallery: AboutGalleryImage[];
};

/** Formato (desde tablet) y velocidad de parallax por posición: 1 y 4 anchas, 2 y 3 angostas. */
const SLOTS = [
  { ratio: "md:aspect-[4/5]", speed: 0.6 },
  { ratio: "md:aspect-[3/5]", speed: 1 },
  { ratio: "md:aspect-[3/5]", speed: 1.3 },
  { ratio: "md:aspect-[4/5]", speed: 0.8 },
];

const DEFAULT_ABOUT: AboutContent = {
  title: "Sobre Smart House",
  title_highlight: "Bolivia",
  intro:
    "Smart House es una empresa boliviana especializada en la venta de electrodomésticos, muebles y tecnología para el hogar. Ofrecemos una amplia gama de productos de marcas reconocidas, con atención personalizada y precios competitivos en todo el país. Nuestro compromiso es brindar soluciones prácticas y de calidad para que cada hogar cuente con lo mejor.",
  mission_title: "Misión",
  mission:
    "Ofrecer a nuestros clientes productos de calidad para el hogar, con atención cercana, precios justos y entrega confiable en toda Bolivia, construyendo relaciones de largo plazo basadas en la confianza y el servicio.",
  vision_title: "Visión",
  vision:
    "Ser la tienda de referencia en Bolivia para electrodomésticos, muebles y tecnología, reconocida por la calidad de su catálogo, la innovación de sus servicios y la satisfacción de sus clientes.",
  gallery: [],
};


const FEATURES: { icon: LucideIcon; t: string; d: string }[] = [
  { icon: Package, t: "Entrega más rápida", d: "Entrega en 24/H" },
  { icon: Trophy, t: "Garantía", d: "Garantía de devolución del 100% del dinero" },
  { icon: CreditCard, t: "Pago Seguro", d: "Tu dinero está seguro" },
  { icon: Headphones, t: "Soporte 24/7", d: "Contacto/mensaje en vivo" },
];

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 104" className={className} aria-hidden="true">
      <path d="M50 2 L4 33 H10 V74 L50 102 Z" fill="#fa8232" />
      <path d="M50 2 L96 33 H90 V74 L50 102 Z" fill="#155eef" />
      <g stroke="#fff" strokeWidth="4.5" strokeLinecap="round">
        <line x1="46" y1="44" x2="35" y2="22" />
        <line x1="44.9" y1="59.4" x2="30" y2="81" />
        <line x1="59" y1="52" x2="85" y2="52" />
      </g>
      <circle cx="50" cy="52" r="9" fill="none" stroke="#fff" strokeWidth="4.5" />
      <g fill="#fff">
        <circle cx="35" cy="22" r="8" />
        <circle cx="30" cy="81" r="8" />
        <circle cx="85" cy="52" r="8" />
      </g>
    </svg>
  );
}

/**
 * Revelado al hacer scroll (IntersectionObserver) y parallax suave del hero.
 * Sin JS o con "reducir movimiento" el contenido se muestra estático.
 */
function useScrollMotion(rootRef: React.RefObject<HTMLDivElement | null>, heroRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    const hero = heroRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    root.classList.add("about-motion");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    root.querySelectorAll(".about-reveal").forEach((el) => io.observe(el));

    if (!hero) {
      return () => {
        io.disconnect();
        root.classList.remove("about-motion");
      };
    }

    // Parallax: solo escucha el scroll mientras el hero está en pantalla y solo escribe --p si cambió,
    // porque cada escritura recalcula estilos de todo el hero.
    let frame = 0;
    let height = hero.offsetHeight || 1;
    let last = "";
    const update = () => {
      frame = 0;
      const p = Math.min(Math.max(-hero.getBoundingClientRect().top / height, 0), 1).toFixed(3);
      if (p !== last) {
        last = p;
        hero.style.setProperty("--p", p);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const ro = new ResizeObserver(() => {
      height = hero.offsetHeight || 1;
    });
    ro.observe(hero);

    // Fuera de pantalla: sin listener de scroll y con los blobs en pausa.
    let listening = false;
    const heroIo = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      hero.classList.toggle("is-idle", !visible);
      if (visible && !listening) {
        window.addEventListener("scroll", onScroll, { passive: true });
        listening = true;
      } else if (!visible && listening) {
        window.removeEventListener("scroll", onScroll);
        listening = false;
      }
      update(); // deja --p en su valor final al entrar o salir
    });
    heroIo.observe(hero);

    return () => {
      io.disconnect();
      heroIo.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      hero.classList.remove("is-idle");
      root.classList.remove("about-motion");
    };
  }, []);
}

/**
 * Galería del hero. En teléfono y tablet pequeña (< 768 px) es un carrusel deslizable con puntos;
 * desde 768 px vuelve a la cuadrícula de 4 columnas con parallax.
 */
function AboutGallery({ gallery }: { gallery: AboutGalleryImage[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const rail = railRef.current;
    const first = rail?.children[0] as HTMLElement | undefined;
    if (!rail || !first) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(rail).columnGap || "0");
    const i = Math.min(Math.round(rail.scrollLeft / (step || 1)), gallery.length - 1);
    if (i !== active) setActive(i);
  };

  const goTo = (i: number) => {
    const rail = railRef.current;
    const el = rail?.children[i] as HTMLElement | undefined;
    if (!rail || !el) return;
    rail.scrollTo({ left: el.offsetLeft - parseFloat(getComputedStyle(rail).paddingLeft || "0"), behavior: "smooth" });
  };

  return (
    <div className="relative mx-auto flex max-w-[1440px] flex-col gap-3.5 pb-[clamp(40px,5vw,64px)]">
      <div
        ref={railRef}
        onScroll={onScroll}
        className="relative flex snap-x snap-mandatory scroll-px-[clamp(16px,4.4vw,64px)] gap-2.5 overflow-x-auto px-[clamp(16px,4.4vw,64px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:snap-none md:grid-cols-[1.25fr_1fr_1fr_1.25fr] md:items-end md:gap-[clamp(8px,1vw,14px)] md:overflow-visible"
      >
        {gallery.map((g, i) => (
          <div
            key={g.position}
            className="about-rise about-parallax w-[74%] flex-none snap-start overflow-hidden rounded-[22px] md:w-auto md:rounded-[24px]"
            style={{ animationDelay: `${200 + i * 80}ms`, ["--speed" as string]: SLOTS[i % SLOTS.length].speed }}
          >
            <picture>
              <source srcSet={g.webp} type="image/webp" />
              <img
                src={g.src}
                alt={g.alt}
                width={900}
                height={1200}
                loading="lazy"
                decoding="async"
                className={`about-zoom block aspect-[3/4] w-full object-cover ${SLOTS[i % SLOTS.length].ratio}`}
                style={{ objectPosition: g.focus }}
              />
            </picture>
          </div>
        ))}
      </div>

      {gallery.length > 1 && (
        <div className="flex justify-center md:hidden">
          {gallery.map((g, i) => (
            <button
              key={g.position}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === active}
              className="flex size-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
            >
              <span
                className={`block h-2 rounded-full transition-[width,background-color] duration-300 ${i === active ? "w-[22px] bg-[#fa8232]" : "w-2 bg-[#d5d8dc]"}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  const { banners = [], about: aboutProp } = usePage<{ banners?: BannerSlide[]; about?: AboutContent | null }>().props;
  const about = aboutProp ?? DEFAULT_ABOUT;
  // Teléfono, dirección y mapa de Admin › Contacto
  const { address, mapsHref, whatsappIntl, whatsappHref: waHref } = useCms();
  const displayPhone = whatsappIntl;
  const whatsappHref = waHref();

  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  useScrollMotion(rootRef, heroRef);

  return (
    <Layout>
      <Seo
        title="Sobre nosotros"
        description="Conoce SmartHouse: misión, visión y características. Tu tienda de confianza en tecnología y electrodomésticos."
      />
      {/* Banners asignados a "Nosotros" en el panel */}
      <HeroCarousel banners={banners} fallback={false} />
      <div ref={rootRef} className="about-page flex flex-col pb-[clamp(64px,8vw,96px)] font-dm_sans text-[#191c1f]">
        {/* Hero con fondo de color animado */}
        <section ref={heroRef} className="about-hero relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_0%,#000_40%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_40%,transparent_100%)]"
            aria-hidden="true"
          >
            <span className="about-blob about-blob--orange" />
            <span className="about-blob about-blob--blue" />
            <span className="about-blob about-blob--peach" />
          </div>

          <div className="about-hero__copy relative mx-auto flex max-w-[1440px] flex-col items-center gap-[22px] px-[clamp(16px,4.4vw,64px)] pb-[clamp(40px,5vw,64px)] pt-[clamp(48px,7vw,96px)] text-center">
            <LogoMark className="about-rise h-auto w-[clamp(56px,6vw,76px)]" />
            <h1
              className="about-rise m-0 max-w-[900px] text-[clamp(40px,6vw,84px)] font-bold leading-[.98] tracking-[-.04em] [text-wrap:balance]"
              style={{ animationDelay: "80ms" }}
            >
              {about.title}
              {about.title_highlight && <> <span className="text-[#fa8232]">{about.title_highlight}</span></>}
            </h1>
            <p
              className="about-rise m-0 max-w-[760px] text-[clamp(16px,1.3vw,19px)] leading-[1.65] text-[#3d4247] [text-wrap:pretty]"
              style={{ animationDelay: "160ms" }}
            >
              {about.intro}
            </p>
          </div>

          <AboutGallery gallery={about.gallery} />
        </section>

        {/* Misión y visión */}
        <section className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 px-[clamp(16px,4.4vw,64px)] pt-[clamp(48px,7vw,88px)] md:grid-cols-2 md:gap-6">
          <div className="about-reveal flex flex-col gap-[18px] rounded-[28px] bg-[#fff4ec] p-[clamp(28px,4vw,56px)]">
            <div className="flex items-center gap-3.5">
              <span className="flex size-[52px] items-center justify-center rounded-full bg-[#fa8232] text-white">
                <Package className="size-6" />
              </span>
              <h2 className="m-0 text-[clamp(30px,3vw,40px)] font-bold tracking-[-.03em]">{about.mission_title}</h2>
            </div>
            <p className="m-0 text-base leading-[1.7] text-[#3d4247] [text-wrap:pretty]">
              {about.mission}
            </p>
          </div>
          <div
            className="about-reveal flex flex-col gap-[18px] rounded-[28px] bg-[#eef3ff] p-[clamp(28px,4vw,56px)]"
            style={{ ["--d" as string]: "120ms" }}
          >
            <div className="flex items-center gap-3.5">
              <span className="flex size-[52px] items-center justify-center rounded-full bg-[#155eef] text-white">
                <Trophy className="size-6" />
              </span>
              <h2 className="m-0 text-[clamp(30px,3vw,40px)] font-bold tracking-[-.03em]">{about.vision_title}</h2>
            </div>
            <p className="m-0 text-base leading-[1.7] text-[#3d4247] [text-wrap:pretty]">
              {about.vision}
            </p>
          </div>
        </section>

        {/* Características */}
        <section className="mx-auto grid w-full max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4 px-[clamp(16px,4.4vw,64px)] pt-[clamp(40px,5vw,64px)]">
          {FEATURES.map(({ icon: Icon, t, d }, i) => (
            <div
              key={t}
              className="about-reveal group flex flex-col gap-4 rounded-[24px] border border-[#eceef0] bg-white p-6 transition-[border-color,translate,box-shadow] duration-300 hover:-translate-y-[3px] hover:border-[#155eef] hover:shadow-[0_14px_30px_rgba(21,94,239,.08)]"
              style={{ ["--d" as string]: `${i * 90}ms` }}
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#155eef] transition-colors duration-300 group-hover:bg-[#155eef] group-hover:text-white">
                <Icon className="size-6" />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-[17px] font-bold">{t}</span>
                <span className="text-[15px] text-[#6b7076]">{d}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Showroom */}
        <section className="mx-auto w-full max-w-[1440px] px-[clamp(16px,4.4vw,64px)] pt-[clamp(40px,5vw,64px)]">
          <div className="about-reveal flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-[#fde3cf] bg-[#fff4ec] p-[clamp(24px,3.4vw,44px)] text-[#191c1f]">
            <div className="flex flex-col gap-2">
              <span className="text-[clamp(24px,2.4vw,32px)] font-bold tracking-[-.02em]">Visita nuestro showroom</span>
              <span className="text-base text-[#6b7076]">{address}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#fa8232] px-[22px] py-3.5 font-bold text-white transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:text-white hover:shadow-[0_10px_24px_rgba(250,130,50,.35)]"
              >
                <MessageCircle className="size-5" />
                {displayPhone}
              </a>
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border-[1.5px] border-[#fa8232] bg-white px-[22px] py-3.5 font-semibold text-[#c2410c] transition-colors duration-200 hover:bg-[#fa8232] hover:text-white"
              >
                <Navigation className="size-5" />
                Cómo llegar
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
