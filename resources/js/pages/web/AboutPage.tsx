import { useEffect, useRef } from "react";
import { usePage } from "@inertiajs/react";
import { CreditCard, Headphones, MessageCircle, Navigation, Package, Trophy, type LucideIcon } from "lucide-react";
import Layout from "@/pages/web/layouts/Layout";
import Seo from "@/components/Seo";

const GALLERY = [
  { src: "/images/about-hero-smarthouse.jpg", webp: null, alt: "Atención en tienda Smart House", ratio: "aspect-[4/5]", speed: 0.6 },
  { src: "/images/about/store-sony.jpg", webp: "/images/about/store-sony.webp", alt: "Showroom Sony", ratio: "aspect-[3/5]", speed: 1 },
  { src: "/images/about/store-samsung.jpg", webp: "/images/about/store-samsung.webp", alt: "Showroom Samsung", ratio: "aspect-[3/5]", speed: 1.3 },
  { src: "/images/about/store-lg.jpg", webp: "/images/about/store-lg.webp", alt: "Showroom LG", ratio: "aspect-[4/5]", speed: 0.8 },
];

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

    let frame = 0;
    const update = () => {
      frame = 0;
      if (!hero) return;
      const h = hero.offsetHeight || 1;
      const p = Math.min(Math.max(-hero.getBoundingClientRect().top / h, 0), 1);
      hero.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      root.classList.remove("about-motion");
    };
  }, []);
}

export default function AboutPage() {
  const { cmsTexts } = usePage<{ cmsTexts?: Record<string, string> }>().props;
  const texts = cmsTexts ?? {};
  const address = texts.footer_address || "Av. 20 de Octubre esq. Rosendo Gutierrez, Edif. Guadalquivir #2332";
  const rawPhone = texts.footer_whatsapp?.replace(/[^\d]/g, "") || "59168210861";
  const displayPhone = texts.footer_whatsapp || "682-10861";
  const whatsappHref = `https://wa.me/${rawPhone}`;
  const mapsHref =
    texts.footer_maps ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address} La Paz Bolivia`)}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  useScrollMotion(rootRef, heroRef);

  return (
    <Layout>
      <Seo
        title="Sobre nosotros"
        description="Conoce SmartHouse: misión, visión y características. Tu tienda de confianza en tecnología y electrodomésticos."
      />
      <div ref={rootRef} className="about-page flex flex-col pb-[clamp(64px,8vw,96px)] font-dm_sans text-[#191c1f]">
        {/* Hero con fondo de color animado */}
        <section ref={heroRef} className="about-hero relative overflow-hidden border-b border-[#eceef0]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
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
              Sobre Smart House <span className="text-[#fa8232]">Bolivia</span>
            </h1>
            <p
              className="about-rise m-0 max-w-[760px] text-[clamp(16px,1.3vw,19px)] leading-[1.65] text-[#3d4247] [text-wrap:pretty]"
              style={{ animationDelay: "160ms" }}
            >
              Smart House es una empresa boliviana especializada en la venta de electrodomésticos, muebles y tecnología para el
              hogar. Ofrecemos una amplia gama de productos de marcas reconocidas, con atención personalizada y precios
              competitivos en todo el país. Nuestro compromiso es brindar soluciones prácticas y de calidad para que cada hogar
              cuente con lo mejor.
            </p>
          </div>

          <div className="relative mx-auto grid max-w-[1440px] grid-cols-2 items-end gap-[clamp(8px,1vw,14px)] px-[clamp(16px,4.4vw,64px)] pb-[clamp(40px,5vw,64px)] md:grid-cols-[1.25fr_1fr_1fr_1.25fr]">
            {GALLERY.map((g, i) => (
              <div
                key={g.src}
                className="about-rise about-parallax overflow-hidden rounded-[24px]"
                style={{ animationDelay: `${200 + i * 80}ms`, ["--speed" as string]: g.speed }}
              >
                <picture>
                  {g.webp && <source srcSet={g.webp} type="image/webp" />}
                  <img
                    src={g.src}
                    alt={g.alt}
                    loading={i < 2 ? "eager" : "lazy"}
                    className={`about-zoom block w-full object-cover ${g.ratio} ${i === 3 ? "object-[50%_30%]" : ""}`}
                  />
                </picture>
              </div>
            ))}
          </div>
        </section>

        {/* Misión y visión */}
        <section className="mx-auto grid w-full max-w-[1440px] grid-cols-1 px-[clamp(16px,4.4vw,64px)] pt-[clamp(48px,7vw,88px)] md:grid-cols-2">
          <div className="about-reveal flex flex-col gap-[18px] rounded-t-[28px] bg-[#fff4ec] p-[clamp(28px,4vw,56px)] md:rounded-l-[28px] md:rounded-tr-none">
            <div className="flex items-center gap-3.5">
              <span className="flex size-[52px] items-center justify-center rounded-full bg-[#fa8232] text-white">
                <Package className="size-6" />
              </span>
              <h2 className="m-0 text-[clamp(30px,3vw,40px)] font-bold tracking-[-.03em]">Misión</h2>
            </div>
            <p className="m-0 text-base leading-[1.7] text-[#3d4247] [text-wrap:pretty]">
              Ofrecer a nuestros clientes productos de calidad para el hogar, con atención cercana, precios justos y entrega
              confiable en toda Bolivia, construyendo relaciones de largo plazo basadas en la confianza y el servicio.
            </p>
          </div>
          <div
            className="about-reveal flex flex-col gap-[18px] rounded-b-[28px] bg-[#eef3ff] p-[clamp(28px,4vw,56px)] md:rounded-r-[28px] md:rounded-bl-none"
            style={{ ["--d" as string]: "120ms" }}
          >
            <div className="flex items-center gap-3.5">
              <span className="flex size-[52px] items-center justify-center rounded-full bg-[#155eef] text-white">
                <Trophy className="size-6" />
              </span>
              <h2 className="m-0 text-[clamp(30px,3vw,40px)] font-bold tracking-[-.03em]">Visión</h2>
            </div>
            <p className="m-0 text-base leading-[1.7] text-[#3d4247] [text-wrap:pretty]">
              Ser la tienda de referencia en Bolivia para electrodomésticos, muebles y tecnología, reconocida por la calidad de su
              catálogo, la innovación de sus servicios y la satisfacción de sus clientes.
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
