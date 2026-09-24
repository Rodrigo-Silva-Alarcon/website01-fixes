const imgImagen = "/images/about-hero-smarthouse.jpg";

function Texto20Px() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[20px] grow items-start min-h-px min-w-[300px] relative shrink-0 text-foreground" data-name="Texto20px">
      <p data-aos="fade-right" className="font-dm_sans font-bold leading-[1.1] relative shrink-0 text-[32px] md:text-[49px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        Sobre Smart House Bolivia
      </p>
      <p data-aos="fade-right" data-aos-delay="100" className="font-poppins-regular leading-[1.4] not-italic relative shrink-0 text-[14px] md:text-[16px] w-full">Smart House es una empresa boliviana especializada en la venta de electrodomésticos, muebles y tecnología para el hogar. Ofrecemos una amplia gama de productos de marcas reconocidas, con atención personalizada y precios competitivos en todo el país. Nuestro compromiso es brindar soluciones prácticas y de calidad para que cada hogar cuente con lo mejor.</p>
    </div>
  );
}

export default function AboutHeroSection() {
  return (
    <div className="relative size-full" data-name="SectionHero">
      <div className="flex flex-col md:flex-row items-center size-full">
        <div className="box-border content-center flex flex-col md:flex-row flex-wrap gap-[32px] md:gap-[64px] items-center px-[20px] md:px-[64px] py-[40px] md:py-[80px] relative size-full">
          <Texto20Px />
          <div data-aos="fade-left" className="basis-0 grow h-[300px] md:h-[500px] min-h-px min-w-[300px] w-full relative rounded-[10px] shrink-0" data-name="Imagen">
            <img alt="Smart House Bolivia" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[10px] size-full" src={imgImagen} />
          </div>
        </div>
      </div>
    </div>
  );
}
