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

  return (
    <div className="relative" data-aos="fade">
      <Carousel 
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[plugin.current]}
      >
        <CarouselContent>
                    
            {banners.map((banner, index) => ( 
            <CarouselItem key={banner.id}>
              {/* h-[300px] md:h-[400px] lg:h-[500px] */}
            <div className="w-full aspect-[9/4] md:aspect-[26/9] xl:aspect-[32/9]">
              <img 
                src={banner.image_url} 
                alt={banner.name} 
                className="w-full h-full object-cover"
              />
            </div>
          </CarouselItem>
          ))}          
        </CarouselContent>        
        <CarouselPrevious className="left-4 bg-white/80 hover:bg-white" />
        <CarouselNext className="right-4 bg-white/80 hover:bg-white" />
      </Carousel>
    </div>
  );
}
