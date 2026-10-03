import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { usePage } from "@inertiajs/react";
import { Banner } from "@/types/models";

export default function HeroSlideshow() {
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const { banners } = usePage<{ banners: Banner[] }>().props;
  const hasMultiple = banners.length > 1;

  return (
    <div className="relative" data-aos="fade">
      <Carousel 
        className="w-full"
        opts={{
          align: "start",
          loop: hasMultiple,
        }}
        plugins={hasMultiple ? [plugin.current] : []}
      >
        <CarouselContent>
                    
            {banners.map((banner, index) => (
            <CarouselItem key={banner.id}>
              {/* h-[300px] md:h-[400px] lg:h-[500px] */}
            <div className="w-full bg-white aspect-[16/9] md:aspect-[2/1] xl:aspect-[21/9] max-h-[560px]">
              <img
                src={banner.image_url}
                alt={banner.name}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                className="w-full h-full object-contain object-[50%_45%]"
              />
            </div>
          </CarouselItem>
          ))}          
        </CarouselContent>        
        {hasMultiple && (
          <>
            <CarouselPrevious className="left-4 bg-white/80 hover:bg-white" />
            <CarouselNext className="right-4 bg-white/80 hover:bg-white" />
          </>
        )}
      </Carousel>
    </div>
  );
}
