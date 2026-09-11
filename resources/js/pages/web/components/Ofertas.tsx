import { productPrice } from "@/lib/product-enquiry";
import svgPaths from "../imports/svg-o54k4pn05p";
import { img as maskImg } from "../imports/svg-nochp";
import { Inventory, Product } from "@/types/models";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/pages/web/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Link, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";


function LinkCarrito({product}:{product:Product}) {
  return (
    <Link 
      href={route('addshop', {product:product.id})}
      className="content-stretch flex gap-[4px] items-center relative shrink-0 ">
      <div
        className="relative shrink-0 size-[20px] hover:text-orange-600"
        data-name="shopping_cart"
      >
        <div
          className="absolute inset-[9.38%_15.53%_10.18%_6.25%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.5px_-2.25px] mask-size-[24px_24px]"
          data-name="shopping_cart"
          style={{ maskImage: `url('${maskImg}')` }}
        >
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 16 17"
          >
            <path
              d={svgPaths.p3d5d4700}
              fill="var(--fill-0, #191C1F)"
              id="shopping_cart"
            />
          </svg>
        </div>
      </div>
      <div
        className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre hover:text-orange-600"
        style={{ fontVariationSettings: "'opsz' 14" }}
      >
        Añadir al carrito
      </div>
    </Link>
  );
}
function Precio({inventory}:{inventory:Inventory}){
  const hoy = new Date();
  const ini = inventory.ini ? new Date(inventory.ini) : null;
  const fin = inventory.fin ? new Date(inventory.fin) : null;

  const mostrarOferta =
    (ini && fin && ini <= hoy && hoy <= fin) || // rango válido
    (ini && !fin && ini <= hoy) ||              // solo fecha inicial
    (!ini && fin && hoy <= fin);                // solo fecha final

  return (
    <div className="content-start flex flex-wrap font-dm_sans font-normal gap-[8px] items-start leading-[24px] relative shrink-0 text-[16px] text-nowrap w-full whitespace-pre">
      <p
        className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid line-through relative shrink-0 text-[#fa8232]"
        style={{ fontVariationSettings: "'opsz' 14" }}
      >
        {inventory.money} {inventory.amount}
      </p>

      {mostrarOferta && (
        <p
          className="relative shrink-0 text-[#191c1f]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          {inventory.money} {inventory.offer_amount}
        </p>
      )}
    </div>
  );
}
function Cards({populares}:{populares:Product[]}) {
  
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
      className="w-full h-[450px]"
      
    >
      <CarouselContent className="-ml-3 md:-ml-4">
        {populares.map((product, index) => (          

          <CarouselItem
            key={index}
            className="pl-3 md:pl-4 basis-1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 mb-5 min-w-[300px]"
          >
            <div
              className="interactive-card bg-[#f2f4f5] relative rounded-[16px] shrink-0 group cursor-pointer h-full"
              data-name="Card"
            >
              <div className="overflow-clip rounded-[inherit] size-full">
                <div className="box-border content-stretch flex flex-col gap-[20px] items-start p-[20px] relative w-full">
                  <Link 
                    href={route('product', {product:product.slug,category:product.category_slug, subcategory:(product.subcategory_slug?product.subcategory_slug:'All')})} className="w-full">
                    <div
                      className="aspect-[1/1] relative shrink-0 w-full mb-2"
                      data-name="image 10"
                    >
                      <img
                        alt=""
                        className="absolute inset-0 max-w-none mix-blend-multiply object-50%-50% object-contain aspect-[1/1] pointer-events-none size-full w-full"
                        src={product.image_url}
                      />
                    </div>
                    <div className="h-0 relative shrink-0 w-full mb-4">
                      <div className="absolute bottom-0 left-0 right-0 top-[-0.5px] ">
                        <svg
                          className="block size-full"
                          fill="none"
                          preserveAspectRatio="none"
                          viewBox="0 0 276 1"
                        >
                          <line
                            id="Line 6"
                            stroke="var(--stroke-0, #191C1F)"
                            strokeWidth="0.5"
                            x2="276"
                            y1="0.25"
                            y2="0.25"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                      <p
                        className="-webkit-box font-dm_sans font-bold leading-[25px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#191c1f] text-[20px] w-full"
                        style={{ fontVariationSettings: "'opsz' 14" }}
                      >
                        {product.name}
                      </p>

                      { productPrice(product.inventory) !== null &&(                      
                        <Precio inventory={product.inventory} />
                      )}                    
                    </div>
                  </Link>

                  {productPrice(product.inventory) !== null && (
                    <div
                    className="box-border content-stretch flex-col gap-[4px] items-center justify-center px-0 py-[4px] relative shrink-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden group-hover:flex"
                    data-name="Botón1"
                  >
                    <LinkCarrito
                      product={product} />
                  </div>
                    )}
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

export default function Ofertas() {
  
  const { populares } = usePage<{ populares: Product[] }>().props;

  return (

    <div data-aos="fade-up" data-aos-delay="100">
      <div data-aos="fade-up" data-aos-delay="100">
        <div className="relative size-full" data-name="Ofertas">
          <div className="flex flex-col items-center size-full">
            <div className="box-border content-stretch flex flex-col gap-[20px] lg:gap-[64px] items-center px-[20px] lg:px-[64px] py-[80px] relative size-full max-w-[100vw]">
              <p
                className="font-dm_sans font-bold leading-[1.1] relative shrink-0 text-[#191c1f] text-[39px] text-center w-full"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                Productos populares
              </p>
              <Cards populares={populares} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}