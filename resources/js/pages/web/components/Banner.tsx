import { Product } from "@/types/models";
import { Link, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import ResponsiveImg from "@/components/ResponsiveImg";
import { isOnOffer, productPrice } from "@/lib/product-enquiry";
import { ArrowRight, Sparkles, Gamepad2, Refrigerator } from "lucide-react";

export default function Destacados() {
  const { destacados, populares } = usePage<{
    destacados?: Product[];
    populares?: Product[];
  }>().props;

  // Tomar los 2 productos destacados, o usar los primeros de populares como fallback
  const items = (destacados && destacados.length > 0 ? destacados : populares || []).slice(0, 2);

  if (items.length === 0) return null;

  const card1 = items[0];
  const card2 = items.length > 1 ? items[1] : items[0];

  const getProductData = (product: Product) => {
    const onOffer = isOnOffer(product.inventory);
    const price = productPrice(product.inventory);
    const money = product.inventory?.money || "Bs.";
    const rawBase = Number(product.inventory?.amount || 0);

    const productUrl = route("product", {
      product: product.slug,
      category: product.category_slug || product.category?.slug,
      subcategory: product.subcategory_slug || "All",
    });

    const categoryName = product.category_label || product.category?.name || "SmartHouse";
    const subcategoryName = product.subcategory_label || product.subcategory?.name || "";
    const categoryLabel = subcategoryName ? `${categoryName} · ${subcategoryName}` : categoryName;

    return { onOffer, price, money, rawBase, productUrl, categoryLabel };
  };

  const data1 = getProductData(card1);
  const data2 = getProductData(card2);

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-12 md:pt-16 grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Banner 1: Fondo Cálido Melocotón (#fff4ec) */}
      <div className="group overflow-hidden rounded-3xl bg-[#fff4ec] p-6 sm:p-10 lg:p-7 xl:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10">
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c2410c]">
            <Gamepad2 className="size-4" />
            {data1.categoryLabel}
          </span>

          <Link
            href={data1.productUrl}
            className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-bold tracking-tight text-[#191c1f] leading-snug line-clamp-2 min-h-[2lh] group-hover:text-[#fa8232] transition-colors"
          >
            {card1.name}
          </Link>

          <div className="flex items-baseline gap-2.5">
            <span className="text-xl sm:text-2xl font-bold text-[#191c1f]">
              {data1.money} {data1.price !== null ? data1.price.toLocaleString() : "Consultar"}
            </span>
            {data1.onOffer && data1.rawBase > 0 && (
              <span className="text-sm text-[#8a8f94] line-through">
                {data1.money} {data1.rawBase.toLocaleString()}
              </span>
            )}
          </div>

          <Link
            href={data1.productUrl}
            className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#fa8232] text-white text-sm font-semibold transition-all duration-200 hover:bg-[#f9751d] hover:shadow-md hover:gap-3"
          >
            Comprar
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <Link
          href={data1.productUrl}
          className="relative size-56 shrink-0 flex items-center justify-center sm:size-auto sm:w-56 sm:self-stretch sm:-my-10 sm:-mr-6 lg:w-48 lg:-my-7 lg:-mr-3 xl:w-60 xl:-my-10 xl:-mr-6"
        >
          <ResponsiveImg
            alt={card1.name}
            className="absolute inset-0 size-full object-contain mix-blend-multiply scale-[1.55] transition-transform duration-300 group-hover:scale-[1.62]"
            src={card1.image_url}
            webpSrc={card1.image_webp_url}
          />
        </Link>
      </div>

      {/* Banner 2: Fondo Azul Suave (#eef3ff) */}
      <div className="group overflow-hidden rounded-3xl bg-[#eef3ff] p-6 sm:p-10 lg:p-7 xl:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#155eef]">
            <Refrigerator className="size-4" />
            {data2.categoryLabel}
          </span>

          <Link
            href={data2.productUrl}
            className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-bold tracking-tight text-[#191c1f] leading-snug line-clamp-2 min-h-[2lh] group-hover:text-[#155eef] transition-colors"
          >
            {card2.name}
          </Link>

          <div className="flex items-baseline gap-2.5">
            <span className="text-xl sm:text-2xl font-bold text-[#191c1f]">
              {data2.money} {data2.price !== null ? data2.price.toLocaleString() : "Consultar"}
            </span>
            {data2.onOffer && data2.rawBase > 0 && (
              <span className="text-sm text-[#8a8f94] line-through">
                {data2.money} {data2.rawBase.toLocaleString()}
              </span>
            )}
          </div>

          <Link
            href={data2.productUrl}
            className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#191c1f] text-white text-sm font-semibold transition-all duration-200 hover:bg-[#3d4247] hover:shadow-md hover:gap-3"
          >
            Comprar
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <Link
          href={data2.productUrl}
          className="relative size-56 shrink-0 flex items-center justify-center sm:size-auto sm:w-56 sm:self-stretch sm:-my-10 sm:-mr-6 lg:w-48 lg:-my-7 lg:-mr-3 xl:w-60 xl:-my-10 xl:-mr-6"
        >
          <ResponsiveImg
            alt={card2.name}
            className="absolute inset-0 size-full object-contain mix-blend-multiply scale-[1.55] transition-transform duration-300 group-hover:scale-[1.62]"
            src={card2.image_url}
            webpSrc={card2.image_webp_url}
          />
        </Link>
      </div>
    </section>
  );
}