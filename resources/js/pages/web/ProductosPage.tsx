import { productPrice } from "@/lib/product-enquiry";
import { FormEventHandler, useEffect, useState } from "react";
import Layout from "@/pages/web/layouts/Layout";
import svgPaths from "@/pages/web/imports/svg-8qsoc3g8o2";

import { img } from "@/pages/web/imports/svg-2rv8o";
import { Product, MenuItem, Category, Brand, Cart } from "@/types/models";
import Price from "@/pages/web/imports/Price";
import { route } from "ziggy-js";
import { Link, router, useForm, usePage } from "@inertiajs/react";

interface FormProps {
  products: Product[];
  categories: Category[];
  brands:Brand[];
  showFilters: boolean;
  onToggleFilters: () => void;
}

interface Pagination<T> {
  data: T[];
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  total:number;
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <div
      className="relative shrink-0 size-[20px]"
      data-name="Component 2"
    >
      <div
        className="absolute inset-[15%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px] mask-size-[20px_20px]"
        style={{ maskImage: `url('${img}')` }}
      >
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 14 14"
        >
          <path
            d={checked ? svgPaths.p32169e00 : svgPaths.p31abc80}
            fill="var(--fill-0, #191C1F)"
          />
        </svg>
      </div>
    </div>
  );
}

function Sidebar({ showFilters, onToggleFilters, categories, brands}: {
    categories: Category[];
    brands:Brand[];
    showFilters: boolean;
    onToggleFilters: () => void;
  }) {

    const { cates } = usePage<{ cates: number[] }>().props;
    const { marcas } = usePage<{ marcas: number[] }>().props;

    // para el envio de formulario
    const { data, setData, post, processing, errors } = useForm({
        cs: [] as number[],
        ms: [] as number[],
        page:0,
    });
    
    const [selectedCategories, setSelectedCategories] = useState<number[]>(cates);
    const [selectedBrands, setSelectedBrands] = useState<number[]>(marcas);

    const toggleCategory = (id: number) => { 
      setSelectedCategories(prev => {
        const newCats = prev.includes(id) 
          ? prev.filter(catId => catId !== id) 
          : [...prev, id];

        setData('cs', newCats); // actualizar también data
        return newCats;   // actualizar selectedCategories
      });
    };

    const [showAll, setShowAll] = useState(false);

    const toggleBrand = (id: number) => {
      setSelectedBrands(prev => {
        const newBrs = prev.includes(id) 
          ? prev.filter(catId => catId !== id) 
          : [...prev, id];

        setData('ms', newBrs); // actualizar también data
        return newBrs;   // actualizar selectedCategories
      });

    };

    const displayedBrands = showAll ? brands : brands.slice(0, 5);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();            
        // Preparar datos para Inertia
        const submitData = {
            cs: data.cs,
            ms: data.ms, 
        };
        post( route('products_post'), {
            ...submitData,
            forceFormData: true, 
        });

    };

  return (
    <div 
      data-aos="fade-right"
      className={`${showFilters ? "block" : "hidden"} lg:block bg-white box-border content-stretch flex flex-col gap-[24px] items-start p-[24px] shrink-0 lg:sticky lg:top-0 w-full lg:w-[269px] h-fit`}
    >
      <div
        aria-hidden="true"
        className="absolute border-[#191c1f] border-[0px_1px_0px_0px] border-solid inset-0 pointer-events-none lg:block hidden"
      />
      <form onSubmit={submit} >

        <button
          onClick={onToggleFilters}
          className="bg-white box-border content-stretch cursor-pointer flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0 lg:flex"
        >
          <div className="relative shrink-0 size-[20px]">
            <div
              className="absolute inset-[27.5%_15%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px_-5.5px] mask-size-[20px_20px]"
              style={{ maskImage: `url('${img}')` }}
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 14 9"
              >
                <path
                  d={svgPaths.p21cbdc80}
                  fill="var(--fill-0, #191C1F)"
                />
              </svg>
            </div>
          </div>
          <p
            className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] text-nowrap whitespace-pre"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </p>
        </button>

        <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
          <p
            className="font-dm_sans font-bold leading-[25px] min-w-full relative shrink-0 text-[#006696] text-[20px] w-[min-content]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            Categorías
          </p>
          
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            {categories.map((categoria) => (
              <button
                key={categoria.id}
                onClick={() => toggleCategory(categoria.id)}
                className={`${selectedCategories.includes(categoria.id) ? "bg-[#f0faff]" : ""} cursor-pointer relative rounded-[16px] shrink-0 w-full`}
              >
                <div className="flex flex-row items-center size-full">
                  <div className="box-border content-stretch flex gap-[8px] items-center px-[8px] py-[4px] relative w-full">
                    <CheckboxIcon
                      checked={selectedCategories.includes(
                        categoria.id,
                      )}
                    />
                    <p
                      className="basis-0 font-dm_sans font-normal leading-[24px] min-h-px min-w-px relative shrink-0 text-[#191c1f] text-[16px]"
                      style={{ fontVariationSettings: "'opsz' 14" }}
                    >
                      {categoria.name}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>


          {/* <button className="box-border content-stretch flex flex-col gap-[4px] items-center justify-center px-0 py-[4px] relative shrink-0">
            <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
              <p
                className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                Cargar más
              </p>
              <div className="relative shrink-0 size-[20px]">
                <div
                  className="absolute inset-[10%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2px] mask-size-[20px_20px]"
                  style={{ maskImage: `url('${img}')` }}
                >
                  <svg
                    className="block size-full"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d={svgPaths.p2d3de00}
                      fill="var(--fill-0, #191C1F)"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </button> */}
          <br />
        </div>

        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 221 1"
            >
              <line
                stroke="var(--stroke-0, #191C1F)"
                strokeWidth="0.5"
                x2="221"
                y1="0.25"
                y2="0.25"
              />
            </svg>
          </div>
        </div>

        <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
          <p
            className="font-dm_sans font-bold leading-[25px] min-w-full relative shrink-0 text-[#006696] text-[20px] w-[min-content]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            Marcas
          </p>
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              {brands.map((marca) => (
                <button
                  key={marca.id}
                  onClick={() => toggleBrand(marca.id)}
                  className={`${selectedBrands.includes(marca.id) ? "bg-[#f0faff]" : ""} cursor-pointer relative rounded-[16px] shrink-0 w-full`}
                >
                  <div className="flex flex-row items-center size-full">
                    <div className="box-border content-stretch flex gap-[8px] items-center px-[8px] py-[4px] relative w-full">
                      <CheckboxIcon
                        checked={selectedBrands.includes(marca.id)}
                      />
                      <p
                        className="basis-0 font-dm_sans font-normal leading-[24px] min-h-px min-w-px relative shrink-0 text-[#191c1f] text-[16px]"
                        style={{ fontVariationSettings: "'opsz' 14" }}
                      >
                        {marca.name}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

          {!showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="box-border content-stretch flex flex-col gap-[4px] items-center justify-center px-0 py-[4px] relative shrink-0"
              >
                <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
                  <p
                    className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre"
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  >
                    Cargar más
                  </p>
                  <div className="relative shrink-0 size-[20px]">
                    <div
                      className="absolute inset-[10%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2px] mask-size-[20px_20px]"
                      style={{ maskImage: `url('${img}')` }}
                    >
                      <svg
                        className="block size-full"
                        fill="none"
                        preserveAspectRatio="none"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d={svgPaths.p2d3de00}
                          fill="var(--fill-0, #191C1F)"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            )} 
          </div>
        </div>

        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 221 1"
            >
              <line
                stroke="var(--stroke-0, #191C1F)"
                strokeWidth="0.5"
                x2="221"
                y1="0.25"
                y2="0.25"
              />
            </svg>
          </div>
        </div>

        <div className="bg-white box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0">
          <button
            type="submit"
            className="interactive-button bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0 hover:bg-[#e67528] transition-colors cursor-pointer"
          data-name="Botón"
          >
            <p
            className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre"
            style={{ fontVariationSettings: "'opsz' 14" }}
            >
              Filtrar
            </p>
          </button>
          {/* <div className="relative shrink-0 size-[20px]">
            <div
              className="absolute inset-[15%_20%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-4px_-3px] mask-size-[20px_20px]"
              style={{ maskImage: `url('${img}')` }}
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 12 14"
              >
                <path
                  d={svgPaths.p26e1fe00}
                  fill="var(--fill-0, #191C1F)"
                />
              </svg>
            </div>
          </div> */}
          {/* <p
            className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] text-nowrap whitespace-pre"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            Limpiar (2) filtros
          </p> */}
        </div>

        {/* <p
          className="font-dm_sans font-normal leading-[20px] min-w-full relative shrink-0 text-[#cacccd] text-[14px] text-center w-[min-content]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          1,379 productos encontrados
        </p> */}
      </form>
    </div>
  );
}

function ProductCard({
  product,
}: {
  product: Product;
}) {
  return (
    <div data-aos="fade-up" className="interactive-card basis-0 bg-[#f2f4f5] grow min-h-px min-w-[280px] md:min-w-[300px] relative rounded-[16px] shrink-0 max-w-[337px]">
      <div className="min-w-inherit overflow-clip rounded-[inherit] size-full">
        <Link 
          href={route('product', {category:product.category_slug, subcategory:(product.subcategory_slug?product.subcategory_slug:'All'), product:product.slug})}          
          className="box-border content-stretch flex flex-col gap-[20px] items-start min-w-inherit p-[20px] relative w-full cursor-pointer text-left hover:opacity-90 transition-opacity"
        >
          <div className="aspect-[264/264] relative shrink-0 w-full">
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
                viewBox="0 0 297 1"
              >
                <line
                  stroke="var(--stroke-0, #191C1F)"
                  strokeWidth="0.5"
                  x2="297"
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
            { productPrice(product.inventory) !== null && (
                <>
                  <Price 
                    inventory={product.inventory}/>
                </>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}

function Pagination({ products }: { products: Pagination<Product> }) {
  const { cates = [], marcas = [], find = '' } = usePage<{
    cates: number[]; marcas: number[]; find: string;
  }>().props;

  if (!products?.links || products.links.length <= 3) return null;

  return (
    <nav aria-label="Paginación de productos" className="flex flex-wrap justify-center gap-3">
      {products.links.map((link, index) => (
        <button
          key={index}
          type="button"
          disabled={!link.url || link.active}
          aria-current={link.active ? 'page' : undefined}
          onClick={() => {
            if (link.url) router.get(link.url, { cs: cates, ms: marcas, find }, { preserveScroll: true });
          }}
          className={`rounded-full px-4 py-2 disabled:cursor-default ${link.active ? 'bg-[#fa8232] text-white' : 'border disabled:opacity-40'}`}
        >
          {index === 0 ? 'Anterior' : index === products.links.length - 1 ? 'Siguiente' : link.label}
        </button>
      ))}
    </nav>
  );
}

function Productos() {
  
  const { products } = usePage<{ products: Pagination<Product> }>().props;

  return (
    <>
      {/* Products Grid */}
      <div className="basis-0 grow min-w-[300px] relative shrink-0">
        <div className="flex flex-col items-center min-w-inherit size-full">
          <div className="box-border content-stretch flex flex-col gap-[32px] md:gap-[64px] items-center min-w-inherit p-[20px] md:p-[40px] lg:p-[64px] relative w-full">
            {/* Products */}
            <div className="content-start flex flex-wrap gap-[16px] items-start relative shrink-0 w-full justify-center lg:justify-start">
              {(products?.data || []).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
            {/* Pagination */}
            <div data-aos="fade-up">
              <Pagination products={products}/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


export default function ProductosPage({categories, brands}:FormProps) {
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <Layout>
        <div className="max-w-[1440px] mx-auto w-full mt-4">
          {/* Main Content */}
          <div className="content-start flex flex-col lg:flex-row gap-0 items-start justify-center relative w-full">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden w-full p-4 bg-white border-b">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white box-border content-stretch cursor-pointer flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] w-full"
              >
                <div className="relative shrink-0 size-[20px]">
                  <div
                    className="absolute inset-[27.5%_15%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px_-5.5px] mask-size-[20px_20px]"
                    style={{ maskImage: `url('${img}')` }}
                  >
                    <svg
                      className="block size-full"
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 14 9"
                    >
                      <path
                        d={svgPaths.p21cbdc80}
                        fill="var(--fill-0, #191C1F)"
                      />
                    </svg>
                  </div>
                </div>
                <p
                  className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] text-nowrap whitespace-pre"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  {showFilters
                    ? "Ocultar filtros"
                    : "Mostrar filtros"}
                </p>
              </button>
            </div>
            {/* Sidebar */}
            <Sidebar
              categories={categories}
              brands={brands}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />
            <Productos />
          </div>
        </div>
    </Layout>
  );
}