import { useEffect, useRef, useState, Dispatch, SetStateAction }  from "react";
import svgPaths from "@/pages/web/imports/svg-mrtftqmkvx";
import svgPathsRelated from "@/pages/web/imports/svg-howirk98bg";
import { img } from "@/pages/web/imports/svg-742ld";
import { img as imgArrow } from "@/pages/web/imports/svg-fpqd7";
import { Product, MenuItem, Category, Brand, Cart } from "@/types/models";
import { productEnquiryUrl, productPrice } from "@/lib/product-enquiry";
import Price from "@/pages/web/imports/Price";
import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import Modal from "@/components/modal-web";
import Layout from "@/pages/web/layouts/Layout";
import { usePage } from "@inertiajs/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/pages/web/components/ui/carousel";

type Nl2brProps = {
  text: string;
};

function Nl2br({ text }: Nl2brProps) {
  return (
    <>
     {text.split("\n").map((line: string, index: number) => (
        <div key={index}>
          {line}
          <br />
        </div>
      ))}
    </>
  );
}

function ImageGallery({ images }: { images: { image: string}[] }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;

    // Sincronizar el estado cuando el carousel cambia
    api.on("select", () => {
      setSelectedImage(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!api) return;
    
    // Cuando se hace clic en una miniatura, mover el carousel
    api.scrollTo(selectedImage);
  }, [selectedImage, api]);

  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-[280px] md:min-w-[300px] relative shrink-0">
      {/* Main Image Carousel */}
      <div className="aspect-square md:aspect-[264/264] relative rounded-[20px] shrink-0 w-full">
        <Carousel setApi={setApi} className="w-full h-full">
          <CarouselContent className="h-full">
            {images.map((image, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="aspect-square md:aspect-[264/264] relative rounded-[20px] h-full bg-white">
                  <img
                    alt={`Imagen ${index + 1} del producto`}
                    className="absolute inset-0 max-w-none object-contain pointer-events-none rounded-[20px] size-full"
                    src={image.image}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>

      {/* Thumbnail Gallery */}
      <div className="relative w-full">
        <Carousel
          opts={{
            align: "start",
            slidesToScroll: 1,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {images.map((image, index) => (
              <CarouselItem key={index} className="pl-4 basis-1/3 sm:basis-1/4 md:basis-1/4 lg:basis-1/5">
                <button
                  onClick={() => setSelectedImage(index)}
                  className={`relative rounded-[20px] w-full aspect-square shadow-md ${
                    selectedImage === index
                      ? "ring-2 ring-[#006696]"
                      : ""
                  }`}
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none rounded-[20px]"
                  >
                    <div className="absolute bg-white inset-0 rounded-[20px]" />
                    <img
                      alt={`Miniatura ${index + 1}`}
                      className="absolute max-w-none object-contain rounded-[20px] size-full"
                      src={image.image}
                    />
                  </div>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 -translate-x-0" />
          <CarouselNext className="right-0 translate-x-0" />
        </Carousel>
      </div>
    </div>
  );
}

function StockBadge() {
  return (
    <div
      className="box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0"
      data-name="Botón"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#e0eef3] border-solid inset-0 pointer-events-none rounded-[40px]"
      />
      <p
        className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#e0eef3] text-[16px] text-nowrap whitespace-pre"
        style={{ fontVariationSettings: "'opsz' 14" }}
      >
        ¡Pocos en stock!
      </p>
    </div>
  );
}

function ProductInfo({
  product,
   open, 
   setOpen,
   opent, 
   setOpent,
   modald,
    modalt,
}: {
  product: Product;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  opent: boolean;
  setOpent: Dispatch<SetStateAction<boolean>>;
  modald: boolean;
  modalt:boolean;
}) {
  const hasPrice = productPrice(product.inventory) !== null;
  const whatsappUrl = productEnquiryUrl(product, route('product', {
    category: product.category_slug,
    subcategory: product.subcategory_slug || 'All',
    product: product.slug,
  }));
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [caracteristicasOpen, setCaracteristicasOpen] =
    useState(false);
  
  
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[40px] grow items-start min-h-px min-w-[280px] md:min-w-[300px] relative shrink-0 max-w-[1440px] mx-auto">
      {/* Product Header */}
      <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
        { product?.inventory?.amount < 3 && (
        <StockBadge />
        )}
        {/* Title and Brand */}
        <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
          <p
            className="font-dm_sans font-bold leading-[1.1] relative shrink-0 text-[#006696] text-[32px] md:text-[40px] lg:text-[49px] w-full"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            {product.name}
          </p>

          <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full">
            <p
              className="font-dm_sans font-bold leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              Marca: 
            </p>
            <div
              className="box-border content-stretch flex flex-col gap-[4px] items-center justify-center px-0 py-[4px] relative shrink-0"
              data-name="Botón"
            >
              <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
                <p
                  className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  {product.brand_label}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          {product.summary && (            
              <Nl2br text={product.summary} />            
          )}
        </div>

        {/* Price */}
        {hasPrice && (
            <>
              <Price 
                inventory={product.inventory}/>
            </>
        )}

              {/* Action Buttons */}
      <div className="content-center flex flex-wrap gap-[16px] items-center relative shrink-0 w-full">
        {hasPrice && (
        <Link
          href={route('addshop', { product: product.id })}
          className="bg-white box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0"
          data-name="Botón1"
        >
          <div
            className="relative shrink-0 size-[20px]"
            data-name="local_mall"
          >
            <div
              className="absolute inset-[5%_15%_10%_15%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px_-1px] mask-size-[20px_20px]"
              data-name="local_mall"
              style={{ maskImage: `url('${img}')` }}
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 14 17"
              >
                <path
                  d={svgPaths.p290c6380}
                  fill="var(--fill-0, #191C1F)"
                  id="local_mall"
                />
              </svg>
            </div>
          </div>
          <p
            className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] text-nowrap whitespace-pre"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            Añadir al carrito
          </p>
        </Link>
        )}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="interactive-button bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0"
          data-name="Botón3"
        >
          <div
            className="relative shrink-0 size-[20px]"
            data-name="WhatsApp"
          >
            <div
              className="absolute bottom-0 left-0 right-[0.47%] top-0"
              data-name="Vector"
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 20 20"
              >
                <path
                  d={svgPaths.p3190a280}
                  fill="var(--fill-0, white)"
                  id="Vector"
                />
              </svg>
            </div>
          </div>
          <p
            className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            Comprar por WhatsApp
          </p>
        </a>
      </div>

        <style>{`
        .content_product p{
          margin-top: 1em;
          margin-bottom: 1em;
        }
        .content_product h1, .content_product h2, .content_product h3, .content_product h4, .content_product h5 {
          margin: 0;
          padding: 0;
          font-size: inherit;
          font-weight: inherit;
        }
        .content_product h1 { font-size: 1.8rem;    margin-bottom: 10px; }
        .content_product h2 { font-size: 1.6rem;    margin-bottom: 10px; }
        .content_product h3 { font-size: 1.4rem;    margin-bottom: 10px; }
        .content_product h4 { font-size: 1.2rem;    margin-bottom: 10px; }
        .content_product h5 { font-size: 1rem;     margin-bottom: 10px;}
        .content_product ul, .content_product li {
          margin: revert; padding: revert; list-style: revert;
        }
        .content_product table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          background-color: #fff;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          overflow: hidden;
          padding:30px;
          margin-bottom: 10px;
        }

        .content_product table th,
        .content_product table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
        }

        .content_product table thead th {
          font-weight: 600;
          color: #000;
          background-color: #fff;
        }

        .content_product table tbody tr:last-child td {
          border-bottom: none;
        }

        .content_product table tbody tr:hover {
          background-color: #f8f9fa;
        }

        .content_product table th:first-child,
        .content_product table td:first-child {
          width: 50px;
          font-weight: 600;
        }
        .content_product img {
          max-width:100%;
          margin-bottom: 15px;
        }
      `}</style>

        {/* Collapsible Sections */}
        <div className="box-border content-stretch cursor-pointer flex flex-col items-start pb-[0.5px] pt-0 px-0 relative shrink-0 w-full">
          {/* Description */}
          <button
            
            className="mb-[-0.5px] relative shrink-0 w-full"
            data-name="Colapsable"
          >
            <div className="box-border content-stretch flex flex-col gap-[16px] items-end overflow-clip px-0 py-[16px] relative rounded-[inherit] w-full">
              <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full">
                <div
                  /* onClick={() => setDescriptionOpen(!descriptionOpen)} */
                  onClick={() => (modald?setOpen(true):setDescriptionOpen(!descriptionOpen))}
                  className="basis-0 font-dm_sans font-bold grow h-full leading-[25px] min-h-px min-w-px relative shrink-0 text-[#fa8232] text-[22px] text-left hover:underline cursor-pointer"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  Descripción del Producto
                </div>
                <div
                  className="relative shrink-0 size-[20px]"
                  data-name="add_2"
                >
                  <div
                    className="absolute inset-[15%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px] mask-size-[20px_20px]"
                    data-name="add_2"
                    style={{ maskImage: `url('${img}')` }}
                  >
                    <svg
                      className="block size-full"
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        d={
                          descriptionOpen
                            ? svgPaths.p280580
                            : svgPaths.p280580
                        }
                        fill="var(--fill-0, #191C1F)"
                        id="add_2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              
              {descriptionOpen && (
                <div
                  className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] w-full text-left content_product"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >       
                  <div  dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              )}
            </div>
            <div
              aria-hidden="true"
              className="absolute border-[#191c1f] border-[0.5px_0px] border-solid inset-0 pointer-events-none"
            />
          </button>

          {/* Caracteristicas */}
          { product.tecnical_info &&(
            <button
            /* onClick={() =>
              setCaracteristicasOpen(!caracteristicasOpen)
            } */
            className="mb-[-0.5px] relative shrink-0 w-full"
            data-name="Colapsable"
          >
            <div className="box-border content-stretch flex flex-col gap-[16px] items-end overflow-clip px-0 py-[16px] relative rounded-[inherit] w-full">
              <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full">
                <div
                  
                  onClick={() => (modalt?setOpent(true):setCaracteristicasOpen(!caracteristicasOpen))}
                  className="basis-0 font-dm_sans font-bold grow h-full leading-[25px] min-h-px min-w-px relative shrink-0 text-[#fa8232] text-[22px] text-left hover:underline cursor-pointer"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  Caracteristicas Generales
                </div>
                <div
                  className="relative shrink-0 size-[20px]"
                  data-name="add_2"
                >
                  <div
                    className="absolute inset-[15%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px] mask-size-[20px_20px]"
                    data-name="add_2"
                    style={{ maskImage: `url('${img}')` }}
                  >
                    <svg
                      className="block size-full"
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        d={
                          caracteristicasOpen
                            ? svgPaths.p280580
                            : svgPaths.p280580
                        }
                        fill="var(--fill-0, #191C1F)"
                        id="add_2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              {caracteristicasOpen && (
                <div className="text-left content_product w-full text-[#000]">
                  <div  dangerouslySetInnerHTML={{ __html: product.tecnical_info }} />
                </div>
              )}
            </div>
            <div
              aria-hidden="true"
              className="absolute border-[#191c1f] border-[0.5px_0px] border-solid inset-0 pointer-events-none"
            />
          </button>
          )}
          
        </div>
      </div>

    </div>
  );
}

function RelatedProductCard({product}:{product: Product;}) {
    return (
      <Link
        data-aos="fade-up"
        href={route('product', {product:product.slug,category:product.category_slug, subcategory:(product.subcategory_slug?product.subcategory_slug:'All')})}
        className="interactive-card basis-0 bg-[#f2f4f5] grow min-h-px min-w-[240px] sm:min-w-[260px] md:min-w-[280px] lg:min-w-[300px] relative rounded-[16px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div className="min-w-inherit overflow-clip rounded-[inherit] size-full">
          <div className="box-border content-stretch flex flex-col gap-[20px] items-start min-w-inherit p-[16px] md:p-[20px] relative w-full">
            <div className="aspect-square relative shrink-0 w-full">
              <img
                alt=""
                className="absolute inset-0 max-w-none mix-blend-multiply object-50%-50% object-cover pointer-events-none size-full"
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
                    stroke="var(--stroke-0, #191C1F)"
                    strokeWidth="0.5"
                    x2="276"
                    y1="0.25"
                    y2="0.25"
                  />
                </svg>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full text-left">
              <p
                className="-webkit-box font-['DM_Sans:Bold',sans-serif] font-bold leading-[25px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#191c1f] text-[18px] md:text-[20px] w-full"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                {product.name}
              </p>
              {/* <div className="content-start flex flex-wrap font-['DM_Sans:Regular',sans-serif] font-normal gap-[8px] items-start leading-[24px] relative shrink-0 text-[16px] text-nowrap w-full whitespace-pre">
                {producto.precioAnterior && (
                  <p
                    className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid line-through relative shrink-0 text-[#fa8232]"
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  >
                    Bs. {producto.precioAnterior}.00
                  </p>
                )}
                <p
                  className="relative shrink-0 text-[#191c1f]"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  Bs. {producto.precio}.00
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </Link>
    );
  }

function RelatedProducts() {
  
  const { products } = usePage<{ products: Product[] }>().props;
  return (
    <div className="relative w-full bg-white">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[32px] md:gap-[48px] lg:gap-[64px] items-center px-[20px] md:px-[40px] lg:px-[64px] py-[40px] md:py-[60px] lg:py-[80px] relative w-full">
          {/* Header */}
          <div className="content-center flex flex-wrap gap-[16px] md:gap-[20px] items-center relative shrink-0 w-full">
            <p
              className="basis-0 font-dm_sans font-bold grow leading-[1.1] min-h-px min-w-px relative shrink-0 text-[#191c1f] text-[28px] md:text-[34px] lg:text-[39px]"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              Productos relacionados
            </p>
            {/* <button              
              className="interactive-button bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0"
            >
              <p
                className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                Ver todos
              </p> 
              <div
                className="relative shrink-0 size-[20px]"
                data-name="arrow_right_alt"
              >
                <div
                  className="absolute inset-[30%_20%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-4px_-6px] mask-size-[20px_20px]"
                  data-name="arrow_right_alt"
                  style={{ maskImage: `url('${imgArrow}')` }}
                >
                  <svg
                    className="block size-full"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 12 8"
                  >
                    <path
                      d={svgPathsRelated.p21d64500}
                      fill="var(--fill-0, white)"
                      id="arrow_right_alt"
                    />
                  </svg>
                </div>
              </div>
            </button> */}
          </div>

          {/* Products Grid */}
          <div className="content-start flex gap-[12px] md:gap-[16px] justify-center items-start relative shrink-0 w-full overflow-x-auto pb-4 max-w-[1440px] mx-auto">
            <div className="flex gap-[14px] md:gap-[16px] min-w-full lg:grid lg:grid-cols-4 ">
              {products.map((product) => (
                <RelatedProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormProps {
  menu: MenuItem[];
  populares: Product[];
  product: Product;
  categories: Category[];
  brands:Brand[];
  cart:Cart;
}

function countTextChars(html: string): number {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent?.length ?? 0;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < breakpoint
  );

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

export default function ProductDetailPage({menu, populares, product, categories, brands, cart}:FormProps) {

  const images: { image: string}[] = [];

  if (product.image_url) {
    images.push({ image: product.image_url });
  }

  product.images?.forEach((img) => {
    images.push({ image: img.image_url });
  });

  const ref = useRef<HTMLDivElement | null>(null);
  
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [opent, setOpent] = useState(false);
  
  const charCount = countTextChars(product.description);
  const charCountt = countTextChars(product.tecnical_info);

  const [modald, setModald] = useState((charCount  > 600 && !isMobile?true:false));
  const [modalt, setModalt] = useState((charCountt > 600 && !isMobile?true:false));

  return (
    <Layout>    
        <div className="bg-[#f2f4f5]">
          <div className="box-border content-stretch flex flex-col gap-[40px] md:gap-[60px] lg:gap-[80px] items-center  px-[20px] md:px-[40px] lg:px-[64px] py-[40px] md:py-[60px] lg:py-[80px] relative w-full">
            {/* Product Detail Section */}
            <div className={`content-start flex flex-wrap gap-[32px] md:gap-[48px] lg:gap-[64px] items-start relative shrink-0 w-full`}>
              <div data-aos="fade-right" className="w-full lg:w-xl lg:flex-1">
                <ImageGallery images={images} />
              </div>
              <div data-aos="fade-left" className=" lg:flex-1 max-w-[1440px]" ref={ref}>
                <ProductInfo 
                  product={product} 
                  modald={modald}
                  modalt={modalt}
                  open={open} setOpen={setOpen}
                  opent={opent} setOpent={setOpent}
                  />
              </div>
            </div>
          </div>
        </div>
        {/* Related Products Section */}
        <div data-aos="fade-up">
          <RelatedProducts />
        </div>
        <Modal
            open={open}
            onClose={() => setOpen(false)}
            title={product.name}
        >                          
            <>
            <div
              className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] w-full text-left content_product"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >  
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
            </>                      
        </Modal>  
        <Modal
            open={opent}
            onClose={() => setOpent(false)}
            title={product.name}
        >                          
            <>
            <div
              className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] w-full text-left content_product"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >  
              <div dangerouslySetInnerHTML={{ __html: product.tecnical_info }} />
            </div>
            </>                      
        </Modal>        
    </Layout>
  );
}