import { useEffect, useRef, useState } from "react";
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

  const cards = items.length === 0 ? [] : [
    { product: card1, data: getProductData(card1), Icon: Gamepad2, bg: "bg-[#fff4ec]", shadow: "hover:shadow-orange-500/10", tag: "text-[#c2410c]", hover: "group-hover:text-[#fa8232]", btn: "bg-[#fa8232] hover:bg-[#f9751d]" },
    { product: card2, data: getProductData(card2), Icon: Refrigerator, bg: "bg-[#eef3ff]", shadow: "hover:shadow-blue-500/10", tag: "text-[#155eef]", hover: "group-hover:text-[#155eef]", btn: "bg-[#191c1f] hover:bg-[#3d4247]" },
  ];

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const count = items.length > 1 ? 2 : items.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % count), 7000);
    return () => clearInterval(id);
  }, [count, paused]);

  if (items.length === 0) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    setPaused(true);
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    setPaused(false);
    if (!start || count < 2) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    setActive((a) => (dx < 0 ? (a + 1) % count : (a - 1 + count) % count));
  };

  const renderCard = (c: (typeof cards)[number], extra = "") => {
    const { product, data, Icon } = c;
    return (
      <div className={`group overflow-hidden rounded-3xl ${c.bg} p-6 sm:p-10 lg:p-7 xl:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300 hover:shadow-xl ${c.shadow} ${extra}`}>
        <div className="flex-1 flex flex-col gap-4 min-w-0 w-full">
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${c.tag}`}>
            <Icon className="size-4" />
            {data.categoryLabel}
          </span>
          <Link
            href={data.productUrl}
            className={`text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-bold tracking-tight text-[#191c1f] leading-snug line-clamp-2 min-h-[2lh] transition-colors ${c.hover}`}
          >
            {product.name}
          </Link>
          <div className="flex items-baseline gap-2.5">
            <span className="text-xl sm:text-2xl font-bold text-[#191c1f]">
              {data.money} {data.price !== null ? data.price.toLocaleString() : "Consultar"}
            </span>
            {data.onOffer && data.rawBase > 0 && (
              <span className="text-sm text-[#8a8f94] line-through">
                {data.money} {data.rawBase.toLocaleString()}
              </span>
            )}
          </div>
          <Link
            href={data.productUrl}
            className={`self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold transition-all duration-200 hover:shadow-md hover:gap-3 ${c.btn}`}
          >
            Comprar
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <Link
          href={data.productUrl}
          className="relative w-full h-56 shrink-0 overflow-hidden rounded-2xl sm:rounded-none sm:h-auto sm:w-[45%] sm:self-stretch sm:-my-10 sm:-mr-10 lg:-my-7 lg:-mr-7 xl:-my-10 xl:-mr-10"
        >
          <ResponsiveImg
            alt={product.name}
            className="absolute inset-0 size-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            src={product.image_url}
            webpSrc={product.image_webp_url}
          />
        </Link>
      </div>
    );
  };

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-12 md:pt-16">
      {/* Escritorio: ambas tarjetas */}
      <div className="hidden lg:grid grid-cols-2 gap-4">
        {cards.map((c, i) => (
          <div key={i}>{renderCard(c, "hover:-translate-y-1")}</div>
        ))}
      </div>

      {/* Pantallas pequeñas: una tarjeta que rota cada 7s */}
      <div
        className="lg:hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "pan-y" }}
      >
        <div className="grid">
          {cards.slice(0, count).map((c, i) => (
            <div
              key={i}
              aria-hidden={active !== i}
              className={`col-start-1 row-start-1 transition-all duration-700 ease-in-out ${
                active === i ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
              }`}
            >
              {renderCard(c)}
            </div>
          ))}
        </div>
        {count > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {cards.slice(0, count).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ver banner ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all duration-300 ${active === i ? "w-6 bg-[#191c1f]" : "w-2 bg-[#191c1f]/25"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
