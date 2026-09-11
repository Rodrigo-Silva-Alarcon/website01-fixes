import "@/pages/web/styles/globals.css";
import Ofertas from "@/pages/web/components/Ofertas";
import Categorias from "@/pages/web/components/Categorias";
import MarcasLogos from "@/pages/web/components/Marcas";
import BlockCategory from "@/pages/web/imports/BlockCategory";
import Layout from "@/pages/web/layouts/Layout";
import FeaturesSection from "@/pages/web/imports/Frame1";
import Destacados from "@/pages/web/components/Banner";
import HeroSlideshow from "@/pages/web/components/HeroSlideshow";
import { Product, MenuItem, Category, Brand, Cart, Banner } from "@/types/models";

import "@/pages/web/styles/globals.css";
import AOS from "aos";
import "aos/dist/aos.css"; 

import { useEffect }  from "react";

interface FormProps {
  populares: Product[];
  categorias: Category[];
  destacados: Product[];
  marcas:Brand[];                                
  categories: Category[];  
}

export default function HomePage({populares, categorias, destacados, marcas, categories}:FormProps) {

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);
  
  return (
    <Layout>      
      <HeroSlideshow/>      
      <section className="max-w-[1440px] mx-auto">
        <Ofertas />
        <Categorias />          
        <Destacados />     
      </section>
      <MarcasLogos  />
      <section className="max-w-[1440px] mx-auto">
        <BlockCategory  />
        {/* Características y Beneficios */}
        <div data-aos="fade-up" data-aos-delay="100">
          <FeaturesSection />
        </div>
      </section>
    </Layout>
  );
}