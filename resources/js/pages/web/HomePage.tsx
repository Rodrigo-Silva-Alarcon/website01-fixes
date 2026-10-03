import HeroCarousel from "@/pages/web/components/HeroCarousel";
import Reveal from "@/pages/web/components/Reveal";
import FeaturesBar from "@/pages/web/components/FeaturesBar";
import Categorias from "@/pages/web/components/Categorias";
import Ofertas from "@/pages/web/components/Ofertas";
import Destacados from "@/pages/web/components/Banner";
import BlockCategory from "@/pages/web/imports/BlockCategory";
import MarcasLogos from "@/pages/web/components/Marcas";
import ShowroomSection from "@/pages/web/components/ShowroomSection";
import Layout from "@/pages/web/layouts/Layout";
import Seo from "@/components/Seo";
import { Product, Category, Brand, BannerSlide } from "@/types/models";

interface FormProps {
  banners: BannerSlide[];
  populares: Product[];
  categorias: Category[];
  destacados: Product[];
  brands: Brand[];
  categories: Category[];
}

export default function HomePage({
  banners,
  populares,
  categorias,
  destacados,
  brands,
  categories,
}: FormProps) {
  return (
    <Layout>
      <Seo
        title="Inicio"
        description="SmartHouse - Tecnología y electrodomésticos para tu hogar. Encuentra productos de marcas líderes con los mejores precios."
      />
      <main className="flex w-full flex-col">
        <h1 className="sr-only">Smart House — Tecnología y electrodomésticos para tu hogar</h1>

        {/* 1-3 se pintan sin animación de entrada: están en la primera pantalla
            (el título de Categorías es el LCP en móvil) y no deben esperar al JS */}
        {/* 1. Carrusel principal: banners activos de "Inicio" en el panel (cambia cada 15 s) */}
        <HeroCarousel banners={banners} />

        {/* 2. Barra de Beneficios y Garantías */}
        <FeaturesBar />

        {/* 3. Cuadrícula de Categorías */}
        <Categorias />

        {/* 4. Carrusel de Productos Populares con Descuento */}
        <Reveal>
          <Ofertas />
        </Reveal>

        {/* 5-6. Bloques de Productos por Categoría, con los banners destacados entre Consolas y Equipos de sonido */}
        <BlockCategory
          promo={
            <Reveal>
              <Destacados />
            </Reveal>
          }
        />

        {/* 7. Marquee Infinito de Marcas Aliadas */}
        <Reveal>
          <MarcasLogos />
        </Reveal>

        {/* 8. Showroom Físico en La Paz con WhatsApp y Mapa */}
        <Reveal>
          <ShowroomSection />
        </Reveal>
      </main>
    </Layout>
  );
}