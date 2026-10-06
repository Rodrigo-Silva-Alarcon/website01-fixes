import { Fragment } from "react";
import HeroCarousel from "@/pages/web/components/HeroCarousel";
import Reveal from "@/pages/web/components/Reveal";
import FeaturesBar from "@/pages/web/components/FeaturesBar";
import Categorias from "@/pages/web/components/Categorias";
import HomeProducts from "@/pages/web/components/HomeProducts";
import Destacados from "@/pages/web/components/Banner";
import MarcasLogos from "@/pages/web/components/Marcas";
import ShowroomSection from "@/pages/web/components/ShowroomSection";
import Layout from "@/pages/web/layouts/Layout";
import Seo from "@/components/Seo";
import { BannerSlide, HomeSectionData } from "@/types/models";

interface FormProps {
  banners: BannerSlide[];
  sections: HomeSectionData[];
}

/** Las secciones, su orden y su contenido se editan en Admin › Página de inicio. */
export default function HomePage({ banners, sections }: FormProps) {
  return (
    <Layout>
      <Seo
        title="Inicio"
        description="SmartHouse - Tecnología y electrodomésticos para tu hogar. Encuentra productos de marcas líderes con los mejores precios."
      />
      <main className="flex w-full flex-col">
        <h1 className="sr-only">Smart House — Tecnología y electrodomésticos para tu hogar</h1>

        {sections.map((section, index) => {
          const content = renderSection(section, banners);
          if (!content) return null;
          // Las 3 primeras se pintan sin animación de entrada: están en la primera pantalla
          // (en móvil el título de Categorías es el LCP) y no deben esperar al JS.
          // Productos ya anima su cabecera y su fila por separado.
          const animate = index >= 3 && section.type !== "products";
          return <Fragment key={section.id}>{animate ? <Reveal>{content}</Reveal> : content}</Fragment>;
        })}
      </main>
    </Layout>
  );
}

function renderSection(section: HomeSectionData, banners: BannerSlide[]) {
  switch (section.type) {
    case "hero":
      return <HeroCarousel banners={banners} />;
    case "features":
      return <FeaturesBar items={section.items} />;
    case "categories":
      return <Categorias title={section.title} subtitle={section.subtitle} />;
    case "products":
      return <HomeProducts title={section.title} products={section.products ?? []} link={section.link} />;
    case "promo":
      return <Destacados products={section.products ?? []} />;
    case "brands":
      return <MarcasLogos title={section.title} subtitle={section.subtitle} />;
    case "showroom":
      return <ShowroomSection title={section.title} subtitle={section.subtitle} photos={section.photos} />;
    default:
      return null;
  }
}
