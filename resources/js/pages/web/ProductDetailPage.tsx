import { useRef, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, Landmark, MessageCircle,
  Minus, Package, Plus, ShoppingCart, Store, Truck, type LucideIcon,
} from "lucide-react";
import { Product } from "@/types/models";
import { isOnOffer, productEnquiryUrl, productPrice } from "@/lib/product-enquiry";
import { currencyLabel } from "@/lib/cart";
import Layout from "@/pages/web/layouts/Layout";
import Seo from "@/components/Seo";
import ProductJsonLd from "@/components/ProductJsonLd";
import ProductCard from "@/pages/web/components/ProductCard";
import ResponsiveImg from "@/components/ResponsiveImg";
import { useSmoothRail } from "@/hooks/use-smooth-rail";

const MAX_QTY = 9;

const PERKS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Truck, title: "Delivery gratuito", text: "Entrega en 24 h" },
  { icon: Landmark, title: "Pago seguro", text: "Transferencia, QR o efectivo contra entrega" },
  { icon: Store, title: "Retira en tienda", text: "Av. 20 de Octubre esq. Rosendo Gutierrez" },
];

function formatAmount(value: number): string {
  return value.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function hasText(html?: string | null): boolean {
  return !!html && html.replace(/<[^>]*>|&nbsp;/g, "").trim().length > 0;
}

/** Miniatura de 84px + 12px de separación: el paso de encaje de la fila. */
const THUMB_STEP = 96;

/**
 * Galería del producto: imagen principal (A) y debajo las miniaturas A, B, C…
 * Click en una miniatura → se ve en grande con un fundido cruzado.
 * Si las miniaturas no caben, la fila se desplaza con el mismo movimiento suave del carrito.
 */
function Gallery({ images, name, badge }: { images: string[]; name: string; badge: string | null }) {
  const [index, setIndex] = useState(0);
  const multi = images.length > 1;
  const railRef = useRef<HTMLDivElement>(null);
  const { edges, page, reveal, handlers } = useSmoothRail(railRef, THUMB_STEP, [images.length]);
  const overflow = !(edges.start && edges.end);

  const go = (next: number) => {
    const target = (next + images.length) % images.length;
    if (target === index) return;
    setIndex(target);
    const thumb = railRef.current?.children[target] as HTMLElement | undefined;
    if (thumb) reveal(thumb.offsetLeft, thumb.offsetWidth);
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div
        className="relative aspect-square overflow-hidden rounded-[28px] bg-[#f6f7f8]"
        tabIndex={multi ? 0 : undefined}
        aria-roledescription={multi ? "galería" : undefined}
        aria-label={multi ? `Imagen ${index + 1} de ${images.length} de ${name}` : undefined}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(index - 1);
          if (e.key === "ArrowRight") go(index + 1);
        }}
      >
        {images.length ? (
          // todas apiladas: la activa aparece con fundido cruzado, sin parpadeo entre fotos
          images.map((src, i) => (
            <div
              key={src + i}
              aria-hidden={i !== index}
              className={`absolute inset-[11%] transition-opacity duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
                i === index ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <ResponsiveImg
                src={src}
                alt={i === index ? name : ""}
                loading={i === 0 ? "eager" : "lazy"}
                className="size-full object-contain mix-blend-multiply"
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-[11%] flex flex-col items-center justify-center gap-2.5 text-[#b4b9bf]">
            <Package className="size-32" strokeWidth={0.8} aria-hidden="true" />
            <span className="text-sm">Imagen referencial</span>
          </div>
        )}

        {badge && (
          <span className="absolute left-[18px] top-[18px] rounded-full bg-[#fa8232] px-3 py-1.5 text-[13px] font-bold text-white">{badge}</span>
        )}

        {multi && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Imagen anterior"
              className="absolute left-3.5 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#dfe2e6] bg-white text-[#191c1f] transition-colors hover:border-[#191c1f]"
            >
              <ArrowLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Imagen siguiente"
              className="absolute right-3.5 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#dfe2e6] bg-white text-[#191c1f] transition-colors hover:border-[#191c1f]"
            >
              <ArrowRight className="size-5" />
            </button>
            <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold tabular-nums text-[#3d4247]">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {multi && (
        <div className="flex items-center gap-2">
          {overflow && (
            <button
              type="button"
              onClick={() => page(-1)}
              disabled={edges.start}
              aria-label="Miniaturas anteriores"
              className="flex size-8 flex-none cursor-pointer items-center justify-center rounded-full border border-[#dfe2e6] bg-white text-[#191c1f] transition-colors hover:border-[#fa8232] hover:text-[#c2410c] disabled:cursor-default disabled:opacity-35 disabled:hover:border-[#dfe2e6] disabled:hover:text-[#191c1f]"
            >
              <ChevronLeft className="size-[18px]" />
            </button>
          )}
          <div
            ref={railRef}
            {...handlers}
            onPointerCancel={handlers.onPointerUp}
            role="tablist"
            aria-label="Imágenes del producto"
            className={`cart-rail flex min-w-0 flex-1 gap-3 overflow-x-auto overscroll-x-contain p-0.5 pb-2 select-none ${overflow ? "cursor-grab" : ""}`}
          >
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                role="tab"
                onClick={() => go(i)}
                aria-label={`Ver imagen ${i + 1} de ${images.length}`}
                aria-selected={i === index}
                className={`relative aspect-square w-[84px] flex-none cursor-pointer overflow-hidden rounded-[18px] border-2 bg-[#f6f7f8] p-2 transition-[border-color,opacity] duration-300 ${
                  i === index ? "border-[#fa8232]" : "border-transparent opacity-70 hover:border-[#dfe2e6] hover:opacity-100"
                }`}
              >
                <ResponsiveImg src={src} alt="" loading="lazy" draggable={false} className="size-full object-contain mix-blend-multiply" />
              </button>
            ))}
          </div>
          {overflow && (
            <button
              type="button"
              onClick={() => page(1)}
              disabled={edges.end}
              aria-label="Más miniaturas"
              className="flex size-8 flex-none cursor-pointer items-center justify-center rounded-full border border-[#dfe2e6] bg-white text-[#191c1f] transition-colors hover:border-[#fa8232] hover:text-[#c2410c] disabled:cursor-default disabled:opacity-35 disabled:hover:border-[#dfe2e6] disabled:hover:text-[#191c1f]"
            >
              <ChevronRight className="size-[18px]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Accordion({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#eceef0]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between py-5 text-left text-lg font-bold text-[#191c1f]"
      >
        {title}
        <ChevronDown className={`size-6 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-[350ms] ease-[cubic-bezier(.2,.8,.2,1)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 pb-3 text-[15px] leading-[1.55] text-[#3d4247]">
      <span className="flex-none text-[#6b7076]">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}

export default function ProductDetailPage({ product }: { product: Product }) {
  const { products: related = [] } = usePage<{ products: Product[] }>().props;

  const images = [product.image_url, ...(product.images ?? []).map((i) => i.image_url)].filter(Boolean) as string[];

  const stock = product.inventory?.stock ?? 0;
  const isOutOfStock = stock <= 0;
  const lowStock = !isOutOfStock && stock < 3;
  const price = productPrice(product.inventory);
  const onOffer = isOnOffer(product.inventory);
  const base = Number(product.inventory?.amount || 0);
  const money = currencyLabel(product.inventory?.money || "Bs.");
  const discounted = onOffer && price !== null && base > price;
  const badge = discounted ? `-${Math.round((1 - price! / base) * 100)}%` : null;

  const brand = product.brand_label || product.brand?.name || "";
  const categorySlug = product.category_slug || product.category?.slug;
  const categoryName = product.category_label || product.category?.name || "";
  const subcategoryName = product.subcategory_label || product.subcategory?.name || "";
  const categoryHref = categorySlug ? route("category", { category: categorySlug }) : route("products");
  const subcategoryHref = categorySlug && product.subcategory_slug
    ? route("subcategory", { category: categorySlug, subcategory: product.subcategory_slug })
    : null;
  const productUrl = route("product", {
    category: categorySlug,
    subcategory: product.subcategory_slug || "All",
    product: product.slug,
  });
  const whatsappUrl = productEnquiryUrl(product, productUrl);

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [open, setOpen] = useState({ desc: true, feat: false });
  const maxQty = Math.max(1, Math.min(MAX_QTY, stock));

  const addToCart = () => {
    if (isOutOfStock || adding) return;
    setAdding(true);
    router.post(route("addshop", { product: product.id }), { amount: qty }, {
      preserveScroll: true,
      onSuccess: (page) => {
        const status = (page.props as { flash?: { status?: string } }).flash?.status ?? "";
        if (!/no hay stock/i.test(status)) {
          setAdded(true);
          setTimeout(() => setAdded(false), 2200);
        }
      },
      onFinish: () => setAdding(false),
    });
  };

  const hasDescription = hasText(product.description) || !!product.summary;
  const hasFeatures = hasText(product.technical_info);

  return (
    <Layout>
      <Seo
        title={product.name}
        description={product.summary || product.description?.replace(/<[^>]*>/g, "").slice(0, 160) || "Producto SmartHouse"}
        image={product.image_url || undefined}
        type="product"
      />
      <ProductJsonLd product={product} />

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-[clamp(18px,2.4vw,28px)] px-[clamp(16px,4.4vw,64px)] pt-[clamp(18px,3vw,28px)] font-dm_sans text-[#191c1f]">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-[#6b7076]">
          <Link href={route("home")} className="hover:text-[#c2410c]">Inicio</Link>
          {categoryName && (
            <>
              <ChevronRight className="size-4" />
              <Link href={categoryHref} className="hover:text-[#c2410c]">{categoryName}</Link>
            </>
          )}
          {subcategoryName && subcategoryHref && (
            <>
              <ChevronRight className="size-4" />
              <Link href={subcategoryHref} className="hover:text-[#c2410c]">{subcategoryName}</Link>
            </>
          )}
          <ChevronRight className="size-4" />
          <span className="text-[#191c1f] line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(28px,4vw,56px)]">
          <Gallery images={images} name={product.name} badge={isOutOfStock ? null : badge} />

          <div className="pdp-rise flex max-w-[580px] flex-col gap-[26px]">
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-wrap items-center gap-2.5 text-sm text-[#6b7076]">
                {isOutOfStock ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[13px] font-semibold text-red-700">
                    <span className="size-[7px] rounded-full bg-red-500" />Agotado
                  </span>
                ) : lowStock && (
                  <span className="flex items-center gap-1.5 rounded-full border border-[#fed7aa] bg-[#fff4ec] px-3 py-1.5 text-[13px] font-semibold text-[#c2410c]">
                    <span className="size-[7px] rounded-full bg-[#fa8232]" />¡Pocos en stock!
                  </span>
                )}
                {brand && (
                  <span>
                    Marca:{" "}
                    <Link href={route("brand", { brand })} className="font-semibold text-[#155eef] hover:text-[#c2410c]">{brand}</Link>
                  </span>
                )}
                {brand && categoryName && <span>·</span>}
                {categoryName && (
                  <Link href={subcategoryHref ?? categoryHref} className="hover:text-[#c2410c]">
                    {subcategoryName ? `${categoryName} · ${subcategoryName}` : categoryName}
                  </Link>
                )}
              </div>
              <h1 className="m-0 text-[clamp(30px,3.6vw,48px)] font-bold leading-[1.05] tracking-[-.035em] [text-wrap:balance]">{product.name}</h1>
              {product.summary && (
                <p className="m-0 whitespace-pre-line text-[17px] leading-[1.55] text-[#5b6066] [text-wrap:pretty]">{product.summary}</p>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              {price !== null ? (
                <>
                  <span className="text-[clamp(30px,3vw,36px)] font-bold tracking-[-.02em]">{money} {formatAmount(price)}</span>
                  {discounted && (
                    <>
                      <span className="text-lg text-[#8a8f94] line-through">{money} {formatAmount(base)}</span>
                      <span className="text-sm font-semibold text-[#c2410c]">Ahorras {money} {formatAmount(base - price)}</span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-[clamp(24px,2.4vw,30px)] font-bold text-[#c2410c]">Consultar precio</span>
              )}
            </div>

            {isOutOfStock && (
              <p className="m-0 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-[1.5] text-red-700">
                Este producto no tiene existencias por ahora. Escríbenos por WhatsApp para consultar reabastecimiento o modelos similares.
              </p>
            )}

            {!isOutOfStock && price !== null && (
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center rounded-full border border-[#dfe2e6] p-1">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="Menos"
                    className="flex size-11 cursor-pointer items-center justify-center rounded-full text-[#191c1f] transition-colors hover:bg-[#f4f5f6] disabled:cursor-not-allowed disabled:text-[#b4b9bf] disabled:hover:bg-transparent"
                  >
                    <Minus className="size-5" />
                  </button>
                  <span className="min-w-8 text-center text-[17px] font-semibold" aria-live="polite">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                    aria-label="Más"
                    className="flex size-11 cursor-pointer items-center justify-center rounded-full text-[#191c1f] transition-colors hover:bg-[#f4f5f6] disabled:cursor-not-allowed disabled:text-[#b4b9bf] disabled:hover:bg-transparent"
                  >
                    <Plus className="size-5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={addToCart}
                  disabled={adding}
                  className={`flex min-w-[200px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-white transition-[background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(250,130,50,.3)] disabled:cursor-progress ${added ? "bg-[#155eef]" : "bg-[#fa8232]"}`}
                >
                  {added ? <Check className="size-5" /> : <ShoppingCart className="size-5" />}
                  {added ? "Añadido al carrito" : "Añadir al carrito"}
                </button>
              </div>
            )}

            {/* Boton (no enlace) para que el navegador no muestre la URL larga de WhatsApp al pasar el cursor */}
            <button
              type="button"
              onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] border-[#191c1f] px-6 py-3.5 text-base font-semibold text-[#191c1f] transition-colors hover:bg-[#191c1f] hover:text-white"
            >
              <MessageCircle className="size-5" />
              {isOutOfStock ? "Consultar disponibilidad" : "Consultar por WhatsApp"} · 682-10861
            </button>

            <div className="flex flex-col rounded-[22px] border border-[#eceef0]">
              {PERKS.map(({ icon: Icon, title, text }, i) => (
                <div key={title} className={`flex items-center gap-3.5 px-[18px] py-4 ${i ? "border-t border-[#eceef0]" : ""}`}>
                  <span className="flex size-10 flex-none items-center justify-center rounded-full bg-[#eef3ff] text-[#155eef]">
                    <Icon className="size-5" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-semibold">{title}</span>
                    <span className="text-sm text-[#6b7076]">{text}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col">
              <Accordion title="Descripción" open={open.desc} onToggle={() => setOpen((o) => ({ ...o, desc: !o.desc }))}>
                {hasDescription && hasText(product.description) ? (
                  <div className="content_product text-[15px] leading-[1.6] text-[#3d4247]" dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <>
                    {brand && <Spec k="Marca" v={brand} />}
                    {categoryName && <Spec k="Categoría" v={subcategoryName ? `${categoryName} › ${subcategoryName}` : categoryName} />}
                    <Spec k="Condición" v="Producto original con garantía oficial" />
                  </>
                )}
              </Accordion>
              <Accordion title="Características" open={open.feat} onToggle={() => setOpen((o) => ({ ...o, feat: !o.feat }))}>
                {hasFeatures ? (
                  <div className="content_product text-[15px] leading-[1.6] text-[#3d4247]" dangerouslySetInnerHTML={{ __html: product.technical_info }} />
                ) : (
                  <>
                    <Spec k="Garantía" v="Oficial del fabricante" />
                    <Spec k="Condición" v="Nuevo, sellado" />
                  </>
                )}
              </Accordion>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="flex flex-col gap-7 pb-[clamp(64px,8vw,96px)] pt-[clamp(56px,7vw,88px)]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="m-0 text-[clamp(28px,3vw,36px)] font-bold leading-[1.05] tracking-[-.03em]">También te puede interesar</h2>
              <Link href={categoryHref} className="flex items-center gap-1 text-[15px] font-semibold text-[#c2410c]">
                Ver más<ArrowRight className="size-5" />
              </Link>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,150px),1fr))] gap-[clamp(10px,1.2vw,16px)] sm:grid-cols-[repeat(auto-fill,minmax(min(100%,230px),1fr))]">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} compact />
              ))}
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}
