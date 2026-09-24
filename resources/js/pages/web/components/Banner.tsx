import svgPaths from "../imports/svg-ebgpxejlry";
import { img, img1 } from "../imports/svg-adrl1";
import { Product } from "@/types/models";
import { Link, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import ResponsiveImg from "@/components/ResponsiveImg";
import { currencyLabel } from "@/lib/cart";

function Banner({product}:{product:Product}) {
  return (
    <div className="basis-0 bg-[#e0eef3] flex flex-col grow w-full lg:min-w-[300px] relative rounded-[20px] shrink-0 overflow-hidden" data-name="Banner">
      <div className="flex flex-1 flex-row items-start justify-center min-w-inherit overflow-clip rounded-[inherit]">
        <div className="box-border content-stretch flex flex-col sm:flex-row sm:flex-wrap gap-[20px] sm:gap-[40px] items-start justify-center min-w-inherit p-[20px] relative w-full">
          <div className="basis-0 content-stretch flex flex-col gap-[40px] grow items-start min-h-[306px] min-w-[160px] relative shrink-0" data-name="Content">
            <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full min-w-0" data-name="CONTENT">
              <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full min-w-0" data-name="Heading">
                <div className="content-stretch flex gap-[5px] items-center justify-center relative shrink-0 max-w-full">
                  <div className="relative shrink-0 size-[24px]" data-name="sports_esports">
                    <div className="absolute inset-[22.92%_10.43%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2.504px_-5.5px] mask-size-[24px_24px]" data-name="sports_esports" style={{ maskImage: `url('${img}')` }}>
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 13">
                        <path d={svgPaths.p16a7ea00} fill="var(--fill-0, #008ECC)" id="sports_esports" />
                      </svg>
                    </div>
                  </div>
                  <Link href={route('category', {category:product.category_slug})} className="font-dm_sans font-normal leading-[20px] relative shrink-0 overflow-ellipsis overflow-hidden text-[#006696] text-[14px] text-nowrap whitespace-pre max-w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
                    {product.category_label}
                  </Link>
                </div>
                <Link
                  href={route('product', { product:product.slug, category:product.category_slug, subcategory:(product.subcategory_slug?product.subcategory_slug:'All')})}
                  className="font-dm_sans font-bold leading-[1.2] relative shrink-0 text-[#191c1f] text-[24px] sm:text-[31px] w-full break-words min-w-0" style={{ fontVariationSettings: "'opsz' 14" }}>
                  <p className="mb-0">{product.name}</p>
                  {product.summary && (
                  <p>{product.summary}</p>
                  )}
                </Link>
              </div>
              { product.inventory?.amount &&(
                <p className="font-dm_sans font-bold leading-[25px] relative shrink-0 text-[#c45500] text-[20px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
                  {currencyLabel(product.inventory.money)} {product.inventory.amount}
                </p>
              )}
            </div>
            <Button_pay
              product={product}
              />
          </div>
          <Link
            href={route('product', { product:product.slug, category:product.category_slug, subcategory:(product.subcategory_slug?product.subcategory_slug:'All')})}
            className="relative shrink-0 size-[160px] sm:size-[200px] lg:size-[240px]" data-name="image 6">
            <ResponsiveImg
              alt={product.name}
              className="absolute inset-0 max-w-none object-50%-50% object-contain pointer-events-none size-full"
              src={product.image_url}
              webpSrc={product.image_webp_url}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
function Button_pay({product}:{product:Product}){
  return (
    <button
      type="button"
      onClick={() => router.post(route('addshop', {product:product.id}), {}, { preserveScroll: true })}
      className="interactive-button bg-[#fa8232] hover:bg-[#f9751d] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" 
      data-name="Botón">
      <p className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Comprar
      </p>
      <div className="relative shrink-0 size-[20px]" data-name="arrow_right_alt">
        <div className="absolute inset-[30%_20%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-4px_-6px] mask-size-[20px_20px]" data-name="arrow_right_alt" style={{ maskImage: `url('${img1}')` }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 8">
            <path d={svgPaths.p21d64500} fill="var(--fill-0, white)" id="arrow_right_alt" />
          </svg>
        </div>
      </div>
    </button>
  );
}
function Banner1({product}:{product:Product}) {
  return (
    <div className="basis-0 bg-[#191c1f] flex flex-col grow w-full lg:min-w-[300px] relative rounded-[20px] shrink-0 overflow-hidden" data-name="Banner">
      <div className="flex flex-1 flex-row items-start min-w-inherit overflow-clip rounded-[inherit]">
        <div className="box-border content-stretch flex flex-col sm:flex-row sm:flex-wrap gap-[20px] sm:gap-[40px] items-start min-w-inherit p-[20px] relative w-full">
          <div className="basis-0 content-stretch flex flex-col gap-[40px] grow items-start min-h-[306px] min-w-[160px] relative shrink-0" data-name="Content">
            <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full min-w-0" data-name="CONTENT">
              <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full min-w-0" data-name="Heading">
                <div className="content-stretch flex gap-[5px] items-center justify-center relative shrink-0 max-w-full">
                  <div className="relative shrink-0 size-[24px]" data-name="sports_esports">
                    <div className="absolute inset-[22.92%_10.43%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2.504px_-5.5px] mask-size-[24px_24px]" data-name="sports_esports" style={{ maskImage: `url('${img}')` }}>
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 13">
                        <path d={svgPaths.p16a7ea00} fill="var(--fill-0, #008ECC)" id="sports_esports" />
                      </svg>
                    </div>
                  </div>
                  <Link
                    href={route('category', {category:product.category_slug})}
                    className="font-dm_sans font-normal leading-[20px] relative shrink-0 overflow-ellipsis overflow-hidden text-[#008ecc] text-[14px] text-nowrap whitespace-pre max-w-full"
                    style={{ fontVariationSettings: "'opsz' 14" }}>
                    {product.category_label}
                  </Link>
                </div>
                <Link
                  href={route('product', { product:product.slug, category:product.category_slug, subcategory:(product.subcategory_slug?product.subcategory_slug:'All')})}
                  className="font-dm_sans font-bold leading-[1.2] relative shrink-0 text-[24px] sm:text-[31px] text-white w-full break-words min-w-0" style={{ fontVariationSettings: "'opsz' 14" }}>
                  <p className="mb-0">{product.name}</p>
                  {product.summary && (
                  <p>{product.summary}</p>
                  )}
                </Link>
              </div>
              { product.inventory?.amount &&(
              <p className="font-dm_sans font-bold leading-[25px] relative shrink-0 text-[#fa8232] text-[20px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
                {currencyLabel(product.inventory.money)} {product.inventory.amount}
              </p>
              )}
            </div>
            <Button_pay
              product={product}
              />
          </div>
          <Link
            href={route('product', { product:product.slug, category:product.category_slug, subcategory:(product.subcategory_slug?product.subcategory_slug:'All')})}
            className="relative shrink-0 size-[160px] sm:size-[200px] lg:size-[240px]" data-name="Image">
            <ResponsiveImg
              alt={product.name}
              className="absolute inset-0 max-w-none object-50%-50% object-contain pointer-events-none size-full"
              src={product.image_url}
              webpSrc={product.image_webp_url}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Destacados() {

  const { destacados } = usePage<{ destacados: Product[] }>().props;
  return (
    <div data-aos="zoom-in" data-aos-delay="200">
      <div className="relative size-full" data-name="Banner">
        <div className="size-full">
          <div className="box-border content-start flex flex-col lg:flex-row gap-[16px] items-stretch px-[16px] sm:px-[32px] md:px-[64px] py-[40px] md:py-[80px] relative size-full">
            {destacados.map((product, index) =>
              index % 2 === 0 ? (
                <Banner key={index} product={product} />                
              ) : (
                <Banner1 key={index} product={product} />
              )
            )}            
          </div>
        </div>
      </div>
    </div>
  );
}