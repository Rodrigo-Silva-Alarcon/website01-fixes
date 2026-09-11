import { productPrice } from "@/lib/product-enquiry";
import svgPaths from "./svg-r4o5rnv2kq";
import { img } from "./svg-7mk40";
import svgPathsCart from "./svg-o54k4pn05p";
import { img as maskImgCart } from "./svg-nochp";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/pages/web/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Category, Inventory, Product } from "@/types/models";
import { Link, usePage } from "@inertiajs/react";
import Price from "@/pages/web/imports/Price";
import { route } from 'ziggy-js';

function CategoryTitle({category}:{category:Category}) {
  return (
    <div className="content-center flex flex-wrap gap-[12px] md:gap-[20px] items-center relative shrink-0 w-full">
      <p
        className="basis-0 font-dm_sans font-bold grow leading-[1.1] min-h-px min-w-px relative shrink-0 text-[#191c1f] text-[28px] sm:text-[32px] md:text-[39px]"
        style={{ fontVariationSettings: "'opsz' 14" }}
      >
        {category.name}
      </p>
      <div
        className="bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0 hover:bg-[#e67528] transition-colors cursor-pointer"
        data-name="Botón"
      >
        <Link
          href={route('category', {category:category.slug})}
          className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          Ver más
        </Link>
        <div
          className="relative shrink-0 size-[20px]"
          data-name="arrow_right_alt"
        >
          <div
            className="absolute inset-[30%_20%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-4px_-6px] mask-size-[20px_20px]"
            data-name="arrow_right_alt"
            style={{ maskImage: `url('${img}')` }}
          >
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 12 8"
            >
              <path
                d={svgPaths.p21d64500}
                fill="var(--fill-0, white)"
                id="arrow_right_alt"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddShop({product}:{product:Product}) {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <div
        className="relative shrink-0 size-[20px]"
        data-name="shopping_cart"
      >
        <div
          className="absolute inset-[9.38%_15.53%_10.18%_6.25%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.5px_-2.25px] mask-size-[24px_24px]"
          data-name="shopping_cart"
          style={{ maskImage: `url('${maskImgCart}')` }}
        >
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 16 17"
          >
            <path
              d={svgPathsCart.p3d5d4700}
              fill="var(--fill-0, #191C1F)"
              id="shopping_cart"
            />
          </svg>
        </div>
      </div>
      <Link
        href={route('addshop', {product:product.id})}
        className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] hover:text-orange-600 text-[14px] text-nowrap whitespace-pre"
        style={{ fontVariationSettings: "'opsz' 14" }}
      >
        Añadir al carrito
      </Link>
    </div>
  );
}

function Cards({category}:{category:Category}) {

  return (
    <Carousel
      className="w-full"
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 3000,
          stopOnInteraction: false,
        }),
      ]}
    >
      <CarouselContent className="-ml-3 md:-ml-4">
        {category.products.map((product, index) => {          
          return (
            <CarouselItem
              key={index}
              className="pl-3 md:pl-4 basis-1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 mb-4 min-w-[300px]"
            >
              <div
                className="bg-[#f2f4f5] relative rounded-[16px] transition-shadow duration-300 hover:shadow-[0px_6px_10px_4px_rgba(0,0,0,0.15),0px_2px_3px_0px_rgba(0,0,0,0.3)] group cursor-pointer h-full"
                data-name="Card"
              >
                <div className="min-w-inherit overflow-clip rounded-[inherit] size-full">
                  <div className="box-border content-stretch flex flex-col gap-[20px] items-start min-w-inherit p-[20px] relative w-full">
                    <Link 
                      href={route('product', {product:product.slug,category:product.category_slug, subcategory:(product.subcategory_slug?product.subcategory_slug:'All')})}
                    className="w-full">
                      
                    <div
                      className="aspect-[1/1] relative shrink-0 w-full mb-3"
                      data-name="image 10"
                    >
                      <img
                        alt=""
                        className="absolute inset-0 max-w-none mix-blend-multiply object-50%-50% aspect-[1/1] object-contain pointer-events-none size-full"
                        src={product.image_url}
                      />
                    </div>
                    <div className="h-0 relative shrink-0 w-full">
                      <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
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
                    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full pt-3">
                        <p
                            className="-webkit-box font-dm_sans font-bold leading-[25px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#191c1f] text-[20px] w-full"
                            style={{ fontVariationSettings: "'opsz' 14" }}
                        >
                            {product.name} 
                        </p>
                        { productPrice(product.inventory) !== null && (
                            <>
                             <Price 
                                inventory={product.inventory}/>
                            </>
                        )}
                    </div>
                    </Link>
                    {productPrice(product.inventory) !== null && (
                    <div
                      className="box-border content-stretch flex-col gap-[4px] items-center justify-center px-0 py-[4px] relative shrink-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden group-hover:flex"
                      data-name="Botón1"
                    >
                      <AddShop product={product} />
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}

export default function BlockCategory() {

  const { categories } = usePage<{ categories: Category[] }>().props;

  return (
    <>
    {categories.map((category, index) => {
        if(category.products.length){
            return (                    
            <div key={category.id} data-aos="fade-up" data-aos-delay="100">
                <div className="relative size-full" data-name="Ofertas">
                    <div className="flex flex-col items-center size-full">
                        <div className="box-border content-stretch flex flex-col gap-[32px] md:gap-[64px] items-center px-[16px] sm:px-[32px] md:px-[64px] py-[40px] md:py-[80px] relative size-full max-w-[100vw]">
                            <CategoryTitle 
                                category={category}
                                />
                            <Cards 
                                category={category}
                                />
                        </div>
                    </div>
                    <div className="border-t border-gray-300 my-4 max-w-[1312px] mx-auto"></div>
                </div>
            </div>
            )
        }
        return null; 
    })}
    </>
  );
}
