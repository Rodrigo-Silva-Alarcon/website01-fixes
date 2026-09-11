import "@/pages/web/styles/globals.css";
import Layout from "@/pages/web/layouts/Layout";
import AboutHeroSection from "@/pages/web/components/AboutHeroSection";
import AboutFeaturesSection from "@/pages/web/components/AboutFeaturesSection";
import { MenuItem, Product, Cart } from "@/types/models";

export default function AboutPage() {
  return (
    <Layout>
      <section className="max-w-[1440px] mx-auto">
        {/* Hero Section */}
        <div data-aos="fade-up">
          <AboutHeroSection />
        </div>
        {/* Features Section (Misión, Visión y Características) */}
        <div data-aos="fade-up" data-aos-delay="200">
          <AboutFeaturesSection />
        </div>
      </section>
    </Layout>
  );
}