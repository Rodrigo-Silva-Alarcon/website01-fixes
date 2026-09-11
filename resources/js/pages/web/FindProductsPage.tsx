import { usePage } from "@inertiajs/react";
import { Product, Cart } from "@/types/models";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Info from "@/pages/web/imports/Info";
import Header from "@/pages/web/components/Header";
import Footer from "@/pages/web/components/Footer";
import svgPaths from "@/pages/web/imports/svg-mfz9y2svub";
import img1 from "@/pages/web/assets/f8e9fbf64ad966e39cf0b463c0120ea3d9e01a32.png";
import { img } from "@/pages/web/imports/svg-lrge5";

// Mock data
const productos = [
  {
    id: 1,
    nombre:
      "Nombre de producto 1 con ejemplo de un nombre largo",
    precio: 150,
    precioAnterior: 210,
    imagen: img1,
  },
  {
    id: 2,
    nombre:
      "Nombre de producto 1 con ejemplo de un nombre largo",
    precio: 150,
    precioAnterior: 210,
    imagen: img1,
  },
  {
    id: 3,
    nombre:
      "Nombre de producto 1 con ejemplo de un nombre largo",
    precio: 150,
    precioAnterior: 210,
    imagen: img1,
  },
  {
    id: 4,
    nombre:
      "Nombre de producto 1 con ejemplo de un nombre largo",
    precio: 150,
    precioAnterior: 210,
    imagen: img1,
  },
  {
    id: 5,
    nombre:
      "Nombre de producto 1 con ejemplo de un nombre largo",
    precio: 150,
    precioAnterior: 210,
    imagen: img1,
  },
  {
    id: 6,
    nombre:
      "Nombre de producto 1 con ejemplo de un nombre largo",
    precio: 150,
    precioAnterior: 210,
    imagen: img1,
  },
];

const categorias = [
  "Categoría 1",
  "Categoría 2",
  "Categoría 3",
  "Categoría 4",
  "Categoría 5",
];
const marcas = ["3M", "Marca 2"];

function ProductCard({
  producto,
}: {
  producto: (typeof productos)[0];
}) {
  return (
    <button
      data-aos="fade-up"
      onClick={() =>
        (window.location.hash = `/productos/${producto.id}`)
      }
      className="basis-0 bg-[#f2f4f5] grow min-h-px min-w-[240px] sm:min-w-[260px] md:min-w-[280px] lg:min-w-[300px] relative rounded-[16px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
    >
      <div className="min-w-inherit overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-start min-w-inherit p-[16px] md:p-[20px] relative w-full">
          <div className="aspect-square relative shrink-0 w-full">
            <img
              alt=""
              className="absolute inset-0 max-w-none mix-blend-multiply object-50%-50% object-cover pointer-events-none size-full"
              src={producto.imagen}
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
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full text-left">
            <p
              className="-webkit-box font-dm_sans font-bold leading-[25px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#191c1f] text-[18px] md:text-[20px] w-full"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              {producto.nombre}
            </p>
            <div className="content-start flex flex-wrap font-dm_sans font-normal gap-[8px] items-start leading-[24px] relative shrink-0 text-[16px] text-nowrap w-full whitespace-pre">
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
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="relative rounded-[16px] shrink-0 w-full">
      <button
        onClick={onChange}
        className="flex flex-row items-center size-full w-full"
      >
        <div className="box-border content-stretch flex gap-[8px] items-center px-[8px] py-[4px] relative w-full">
          <div
            className="relative shrink-0 size-[20px]"
            data-name="Component 2"
          >
            <div
              className="absolute inset-[15%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px] mask-size-[20px_20px]"
              data-name="check_box_outline_blank"
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
                    checked
                      ? svgPaths.p31abc80
                      : svgPaths.p31abc80
                  }
                  fill={
                    checked
                      ? "var(--fill-0, #006696)"
                      : "var(--fill-0, #191C1F)"
                  }
                  id="check_box_outline_blank"
                />
              </svg>
            </div>
          </div>
          <p
            className="basis-0 font-dm_sans font-normal grow leading-[24px] min-h-px min-w-px relative shrink-0 text-[#191c1f] text-[16px] text-left"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            {label}
          </p>
        </div>
      </button>
    </div>
  );
}

function FilterSidebar({
  isVisible,
  onToggle,
  selectedCategories,
  selectedMarcas,
  onCategoryChange,
  onMarcaChange,
  onClearFilters,
}: {
  isVisible: boolean;
  onToggle: () => void;
  selectedCategories: string[];
  selectedMarcas: string[];
  onCategoryChange: (cat: string) => void;
  onMarcaChange: (marca: string) => void;
  onClearFilters: () => void;
}) {
  const totalFilters =
    selectedCategories.length + selectedMarcas.length;

  return (
    <div
      data-aos="fade-right"
      className={`bg-white box-border content-stretch flex flex-col gap-[24px] items-start p-[16px] md:p-[24px] shrink-0 ${
        isVisible
          ? "sticky top-0 w-full md:w-[269px]"
          : "hidden md:sticky md:top-0 md:w-[269px] md:flex"
      }`}
      data-name="Lista de filtros"
    >
      <button
        onClick={onToggle}
        className="bg-white box-border content-stretch cursor-pointer flex gap-[8px] items-center justify-center overflow-visible px-[16px] py-[8px] relative rounded-[40px] shrink-0"
        data-name="Botón"
      >
        <div
          className="relative shrink-0 size-[20px]"
          data-name="filter_list"
        >
          <div
            className="absolute inset-[27.5%_15%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px_-5.5px] mask-size-[20px_20px]"
            data-name="filter_list"
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
                id="filter_list"
              />
            </svg>
          </div>
        </div>
        <p
          className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] text-nowrap whitespace-pre"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          {isVisible ? "Ocultar filtros" : "Mostrar filtros"}
        </p>
      </button>

      {/* Categorías */}
      <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
        <p
          className="font-dm_sans font-bold leading-[25px] min-w-full relative shrink-0 text-[#006696] text-[20px] w-[min-content]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          Categorías
        </p>
        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
          {categorias.map((cat) => (
            <FilterCheckbox
              key={cat}
              label={cat}
              checked={selectedCategories.includes(cat)}
              onChange={() => onCategoryChange(cat)}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
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

      {/* Marcas */}
      <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
        <p
          className="font-dm_sans font-bold leading-[25px] min-w-full relative shrink-0 text-[#006696] text-[20px] w-[min-content]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          Marcas
        </p>
        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
          {marcas.map((marca) => (
            <FilterCheckbox
              key={marca}
              label={marca}
              checked={selectedMarcas.includes(marca)}
              onChange={() => onMarcaChange(marca)}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
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

      {/* Clear Filters */}
      <button
        onClick={onClearFilters}
        disabled={totalFilters === 0}
        className="bg-white box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0 w-full disabled:opacity-50"
        data-name="Botón"
      >
        <div
          className="relative shrink-0 size-[20px]"
          data-name="delete"
        >
          <div
            className="absolute inset-[15%_20%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-4px_-3px] mask-size-[20px_20px]"
            data-name="delete"
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
                fill="var(--fill-0, #CACCCD)"
                id="delete"
              />
            </svg>
          </div>
        </div>
        <p
          className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#cacccd] text-[16px] text-nowrap whitespace-pre"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          Limpiar ({totalFilters}) filtros
        </p>
      </button>

      <p
        className="font-dm_sans font-normal leading-[20px] min-w-full relative shrink-0 text-[#cacccd] text-[14px] text-center w-[min-content]"
        style={{ fontVariationSettings: "'opsz' 14" }}
      >
        {productos.length} productos encontrados
      </p>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 flex-wrap justify-center">
      <button
        onClick={() =>
          onPageChange(Math.max(1, currentPage - 1))
        }
        disabled={currentPage === 1}
        className="bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0 disabled:opacity-50"
      >
        <div
          className="relative shrink-0 size-[20px]"
          data-name="chevron_backward"
        >
          <div
            className="absolute bottom-1/4 left-[35%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-7px_-5px] mask-size-[20px_20px] right-[34.69%] top-1/4"
            data-name="chevron_backward"
            style={{ maskImage: `url('${img}')` }}
          >
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 7 10"
            >
              <path
                d={svgPaths.p22a1e500}
                fill="var(--fill-0, white)"
                id="chevron_backward"
              />
            </svg>
          </div>
        </div>
      </button>

      {[1, 2, 3].map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`box-border content-stretch flex gap-[10px] items-center justify-center p-[4px] relative rounded-[40px] shrink-0 ${
            currentPage === page
              ? "border border-[#191c1f] border-solid"
              : ""
          }`}
        >
          <p
            className="font-dm_sans font-bold leading-[25px] relative shrink-0 text-[#191c1f] text-[20px] text-center w-[30px]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            {page}
          </p>
        </button>
      ))}

      <div className="box-border content-stretch flex gap-[10px] items-center justify-center p-[4px] relative rounded-[40px] shrink-0">
        <p
          className="font-dm_sans font-bold leading-[25px] relative shrink-0 text-[#191c1f] text-[20px] text-center w-[30px]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          ...
        </p>
      </div>

      <button
        onClick={() => onPageChange(totalPages)}
        className="box-border content-stretch flex gap-[10px] items-center justify-center p-[4px] relative rounded-[40px] shrink-0"
      >
        <p
          className="font-dm_sans font-bold leading-[25px] relative shrink-0 text-[#191c1f] text-[20px] text-center w-[30px]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          {totalPages}
        </p>
      </button>

      <button
        onClick={() =>
          onPageChange(Math.min(totalPages, currentPage + 1))
        }
        disabled={currentPage === totalPages}
        className="bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0 disabled:opacity-50"
      >
        <div
          className="relative shrink-0 size-[20px]"
          data-name="chevron_forward"
        >
          <div
            className="absolute bottom-1/4 left-[34.69%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-6.938px_-5px] mask-size-[20px_20px] right-[35%] top-1/4"
            data-name="chevron_forward"
            style={{ maskImage: `url('${img}')` }}
          >
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 7 10"
            >
              <path
                d={svgPaths.p15c42280}
                fill="var(--fill-0, white)"
                id="chevron_forward"
              />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
}

export default function FindProductsPage() {
  const { props: shared } = usePage<{ populares: Product[]; cart: Cart }>();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("q") || "";

  const [filtersVisible, setFiltersVisible] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<
    string[]
  >([]);
  const [selectedMarcas, setSelectedMarcas] = useState<
    string[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat],
    );
  };

  const handleMarcaChange = (marca: string) => {
    setSelectedMarcas((prev) =>
      prev.includes(marca)
        ? prev.filter((m) => m !== marca)
        : [...prev, marca],
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedMarcas([]);
  };

  const handleRemoveSearchTerm = () => {
    window.location.hash = "/buscar";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Info Banner */}
      <div className="h-[40px]">
        <Info />
      </div>

      {/* Header */}
      <div className="h-[82px] md:h-[82.635px]">
        <Header populares={shared.populares} cart={shared.cart} />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1440px] mx-auto">
        <div className="content-start flex flex-col md:flex-row gap-0 items-start justify-center relative w-full">
          {/* Filters Sidebar */}
          <FilterSidebar
            isVisible={filtersVisible}
            onToggle={() => setFiltersVisible(!filtersVisible)}
            selectedCategories={selectedCategories}
            selectedMarcas={selectedMarcas}
            onCategoryChange={handleCategoryChange}
            onMarcaChange={handleMarcaChange}
            onClearFilters={handleClearFilters}
          />

          {/* Products Section */}
          <div className="basis-0 grow min-h-px min-w-[280px] md:min-w-[300px] relative shrink-0">
            <div className="flex flex-col items-center min-w-inherit size-full">
              <div className="box-border content-stretch flex flex-col gap-[40px] md:gap-[48px] lg:gap-[64px] items-center min-w-inherit px-[20px] md:px-[40px] lg:px-[64px] py-[40px] md:py-[60px] lg:py-[80px] relative w-full">
                {/* Header with Search Term */}
                <div className="content-stretch flex flex-col gap-[16px] items-start justify-center relative shrink-0 w-full">
                  <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
                    <p
                      className="font-dm_sans font-bold leading-[1.1] relative shrink-0 text-[#191c1f] text-[32px] md:text-[40px] lg:text-[49px] w-full"
                      style={{
                        fontVariationSettings: "'opsz' 14",
                      }}
                    >
                      Resultados de búsqueda
                    </p>
                  </div>
                  {searchTerm && (
                    <button
                      onClick={handleRemoveSearchTerm}
                      className="bg-[#f0faff] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0"
                    >
                      <p
                        className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] text-nowrap whitespace-pre"
                        style={{
                          fontVariationSettings: "'opsz' 14",
                        }}
                      >
                        {searchTerm}
                      </p>
                      <div
                        className="relative shrink-0 size-[20px]"
                        data-name="close_small"
                      >
                        <div
                          className="absolute inset-[30.1%_30.1%_30%_30%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-6px_-6.021px] mask-size-[20px_20px]"
                          data-name="close_small"
                          style={{ maskImage: `url('${img}')` }}
                        >
                          <svg
                            className="block size-full"
                            fill="none"
                            preserveAspectRatio="none"
                            viewBox="0 0 8 8"
                          >
                            <path
                              d={svgPaths.pea1f580}
                              fill="var(--fill-0, #191C1F)"
                              id="close_small"
                            />
                          </svg>
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Products Grid */}
                <div className="content-start flex flex-wrap gap-[12px] md:gap-[16px] items-start relative shrink-0 w-full">
                  {productos.map((producto) => (
                    <ProductCard
                      key={producto.id}
                      producto={producto}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={13}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}