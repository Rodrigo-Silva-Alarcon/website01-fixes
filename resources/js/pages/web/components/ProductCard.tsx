import { isOnOffer, productPrice } from "@/lib/product-enquiry";
import { currencyLabel } from "@/lib/cart";
import { Product } from "@/types/models";
import { Link, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import ResponsiveImg from "@/components/ResponsiveImg";
import {
  CookingPot, Gamepad2, Headphones, Microwave, Package, Refrigerator,
  ShoppingCart, Smartphone, Speaker, Tv, WashingMachine, type LucideIcon,
} from "lucide-react";

type ProductCardProps = {
  product: Product;
  /** Posición en la lista: escalona la animación de entrada. */
  index?: number;
  className?: string;
  /** Variante del listado: "marca · categoría" y botón redondo de carrito junto al precio. */
  compact?: boolean;
};

// Ícono referencial cuando el producto no tiene imagen, según su subcategoría/categoría
const PLACEHOLDER_ICONS: [RegExp, LucideIcon][] = [
  [/aud[ií]fono|auricular/i, Headphones],
  [/parlante|barra|sonido|audio|minicomponente/i, Speaker],
  [/microondas/i, Microwave],
  [/refrigerador|heladera|freezer/i, Refrigerator],
  [/lavadora|secadora/i, WashingMachine],
  [/horno|cocina/i, CookingPot],
  [/televisor|tv/i, Tv],
  [/celular|smartphone|tel[eé]fono/i, Smartphone],
  [/consola|gaming|juego/i, Gamepad2],
];

function placeholderIcon(product: Product): LucideIcon {
  const label = `${product.subcategory_label || ""} ${product.category_label || ""}`;
  return PLACEHOLDER_ICONS.find(([re]) => re.test(label))?.[1] ?? Package;
}

function formatAmount(value: number): string {
  return value.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ProductCard({ product, index = 0, className = "", compact = false }: ProductCardProps) {
  const onOffer = isOnOffer(product.inventory);
  const price = productPrice(product.inventory);
  const money = currencyLabel(product.inventory?.money || "Bs.");
  const rawBase = Number(product.inventory?.amount || 0);
  const isOutOfStock = (product.inventory?.stock ?? 0) <= 0;

  let discountPercent: number | null = null;
  if (onOffer && price !== null && rawBase > price) {
    discountPercent = Math.round(((rawBase - price) / rawBase) * 100);
  }

  const productUrl = route("product", {
    product: product.slug,
    category: product.category_slug || product.category?.slug,
    subcategory: product.subcategory_slug || "All",
  });

  const brandName = product.brand_label || product.brand?.name || "";

  const handleAddToCart = () => {
    router.post(route("addshop", { product: product.id }), {}, { preserveScroll: true });
  };

  if (compact) {
    const PlaceholderIcon = placeholderIcon(product);
    const meta = [brandName, product.subcategory_label || product.category_label].filter(Boolean).join(" · ");

    return (
      <article className={`product-card @container group relative flex h-full flex-col gap-3.5 rounded-[24px] border border-[#eceef0] bg-white p-2.5 ${className}`}>
        <svg className="product-card__trace" aria-hidden="true">
          <rect pathLength={100} rx={24} ry={24} />
        </svg>

        <Link
          href={productUrl}
          className="relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-[#f6f7f8]"
        >
          {product.image_url ? (
            <ResponsiveImg
              alt={product.name}
              loading="lazy"
              className="product-card__img absolute inset-[12%] size-[76%] object-contain mix-blend-multiply"
              src={product.image_url}
              webpSrc={product.image_webp_url}
              thumbWebpSrc={product.image_thumbs_webp_url}
              sizes="(max-width: 640px) 50vw, 300px"
            />
          ) : (
            <span className="flex flex-col items-center gap-1.5 text-[#b4b9bf]">
              <PlaceholderIcon className="size-14" strokeWidth={1.1} aria-hidden="true" />
              <span className="text-xs tracking-[.04em]">Imagen referencial</span>
            </span>
          )}
          <span className="product-card__shine" aria-hidden="true" />

          {isOutOfStock ? (
            <span className="absolute left-3 top-3 rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
              Agotado
            </span>
          ) : discountPercent !== null && (
            <span className="absolute left-3 top-3 rounded-full bg-[#fa8232] px-2.5 py-1 text-xs font-bold text-white">
              -{discountPercent}%
            </span>
          )}
        </Link>

        <div className="flex min-h-[66px] flex-col gap-1 px-1.5">
          <span className="text-xs font-semibold uppercase tracking-[.06em] text-[#6b7076] line-clamp-2">{meta}</span>
          <Link href={productUrl} className="text-base font-semibold leading-[1.3] text-[#191c1f] line-clamp-3 hover:text-[#c2410c]">
            {product.name}
          </Link>
        </div>

        <div className="mt-auto flex flex-col items-stretch gap-2 px-1.5 pb-1.5 @[220px]:flex-row @[220px]:items-center @[220px]:justify-between">
          <div className="flex min-w-0 flex-col">
            {price !== null ? (
              <>
                <span className="whitespace-nowrap text-[16px] font-bold text-[#191c1f] @[220px]:text-[clamp(16px,1.4vw,19px)]">
                  {money} {formatAmount(price)}
                </span>
                <span className="min-h-[17px] text-[13px] text-[#8a8f94] line-through">
                  {onOffer && rawBase > price ? `${money} ${formatAmount(rawBase)}` : ""}
                </span>
              </>
            ) : (
              <>
                <span className="whitespace-nowrap text-base font-bold text-[#c2410c]">Consultar precio</span>
                <span className="min-h-[17px]" />
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? `${product.name} agotado` : `Añadir ${product.name} al carrito`}
            className="flex h-10 w-full flex-none cursor-pointer items-center justify-center gap-2 rounded-full bg-[#fa8232] text-white transition-[background-color,transform] duration-200 @[220px]:size-11 @[220px]:hover:scale-[1.08] hover:bg-[#f9751d] disabled:cursor-not-allowed disabled:bg-[#e4e7e9] disabled:text-[#77878f] disabled:hover:scale-100"
          >
            <ShoppingCart className="size-5" />
            <span className="text-sm font-semibold @[220px]:hidden">{isOutOfStock ? "Sin stock" : "Añadir"}</span>
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      data-aos="fade-up"
      data-aos-delay={(index % 4) * 80}
      className={`product-card group relative flex h-full flex-col gap-3 rounded-[24px] border border-[#eceef0] bg-white p-2.5 ${className}`}
    >
      {/* Borde que se traza alrededor de la tarjeta al pasar el cursor */}
      <svg className="product-card__trace" aria-hidden="true">
        <rect pathLength={100} rx={24} ry={24} />
      </svg>

      {/* Imagen: caja cuadrada idéntica en todas las tarjetas */}
      <Link
        href={productUrl}
        className="relative block aspect-square w-full shrink-0 overflow-hidden rounded-[16px] bg-[#f6f7f8]"
      >
        <ResponsiveImg
          alt={product.name}
          loading="lazy"
          className="product-card__img absolute inset-0 size-full object-contain p-4 mix-blend-multiply"
          src={product.image_url}
          webpSrc={product.image_webp_url}
          thumbWebpSrc={product.image_thumbs_webp_url}
          sizes="(max-width: 640px) 50vw, 300px"
        />
        <span className="product-card__shine" aria-hidden="true" />

        {discountPercent !== null && !isOutOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-[#fa8232] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            -{discountPercent}%
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute left-3 top-3 rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 shadow-sm">
            Agotado
          </span>
        )}
      </Link>

      {/* Marca y nombre: alturas fijas para que todas las tarjetas queden alineadas */}
      <div className="flex flex-col gap-1 px-1.5">
        <span className="h-4 text-[11px] font-semibold uppercase leading-4 tracking-wider text-[#6b7076] line-clamp-1">
          {brandName}
        </span>
        <Link
          href={productUrl}
          className="min-h-[44px] text-[15px] font-semibold leading-[22px] text-[#191c1f] line-clamp-2 transition-colors group-hover:text-[#fa8232] sm:text-[16px]"
        >
          {product.name}
        </Link>
      </div>

      {/* Precio: siempre visible */}
      <div className="flex min-h-[46px] flex-col justify-end px-1.5">
        {price !== null ? (
          <>
            <span className="text-lg font-bold leading-6 text-[#191c1f] whitespace-nowrap">
              {money} {formatAmount(price)}
            </span>
            <span className="h-[18px] text-xs leading-[18px] text-[#8a8f94] line-through">
              {onOffer && rawBase > price ? `${money} ${formatAmount(rawBase)}` : ""}
            </span>
          </>
        ) : (
          <>
            <span className="text-lg font-bold leading-6 text-[#fa8232] whitespace-nowrap">Consultar precio</span>
            <span className="h-[18px]" />
          </>
        )}
      </div>

      {/* Añadir al carrito: fijado al pie de la tarjeta */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        aria-label={isOutOfStock ? `${product.name} agotado` : `Añadir ${product.name} al carrito`}
        className="product-card__cta mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#fa8232] text-sm font-semibold text-white shadow-sm hover:bg-[#f9751d] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#e4e7e9] disabled:text-[#77878f] disabled:shadow-none cursor-pointer"
      >
        <ShoppingCart className="product-card__cart size-[18px]" />
        {isOutOfStock ? "Sin stock" : "Añadir al carrito"}
      </button>
    </article>
  );
}
