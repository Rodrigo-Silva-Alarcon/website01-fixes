import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/pages/web/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Brand } from "@/types/models";
import { usePage, Link } from "@inertiajs/react";
import { route } from 'ziggy-js';

function Frame10124020({marcas}:{marcas:Brand[]}) {

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
        slidesToScroll: 1,
      }}
      plugins={[
        Autoplay({
          delay: 3000,
          stopOnInteraction: false,
        }),
      ]}
      className="w-full"
    >
      <CarouselContent className="-ml-3 md:-ml-4">
        {marcas.map((brand) => (
          <CarouselItem
            key={brand.id}
            className="pl-3 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
          >
            <Link
              href={route('brand', brand.id)}
              className="interactive-card bg-white box-border content-stretch flex flex-col items-start p-[20px] relative rounded-[16px] shrink-0 h-full"
              data-name="Marcas"
            >
              <div
                className="h-[100px] relative shrink-0 w-full"
                data-name="image 4"
              >
                <img
                  alt={brand.name}
                  className="absolute inset-0 max-w-none object-50%-50% object-contain pointer-events-none size-full"
                  src={brand.image_url}
                />
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

export default function Marcas() {  

  const { marcas } = usePage<{ marcas: Brand[] }>().props;

  return (
    <div data-aos="fade-up" data-aos-delay="100">
      <div
        className="bg-[#f2f4f5] relative size-full"
        data-name="Marcas"
      >
        <div className="max-w-[1440px] mx-auto">
          <div className="box-border content-stretch flex flex-col gap-[32px] md:gap-[64px] items-start px-[16px] sm:px-[32px] md:px-[64px] py-[40px] md:py-[80px] relative size-full">
            <p
              className="font-dm_sans font-bold leading-[1.1] relative shrink-0 text-[#191c1f] text-[28px] sm:text-[32px] md:text-[39px] text-center w-full"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              Marcas con las que trabajamos
            </p>
            <Frame10124020 
              marcas={marcas}
              />
          </div>
        </div>
      </div>
    </div>
  );
}