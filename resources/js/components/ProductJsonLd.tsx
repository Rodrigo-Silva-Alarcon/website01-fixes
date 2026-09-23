import { Head } from "@inertiajs/react";
import { productPrice } from "@/lib/product-enquiry";
import { Product } from "@/types/models";

const SITE_NAME = "SmartHouse";

function stripHtml(value?: string | null): string {
  return (value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function absoluteUrl(pathname?: string): string {
  if (typeof window === "undefined") return pathname ?? "";
  if (pathname?.startsWith("http")) return pathname;
  return new URL(pathname ?? window.location.pathname, window.location.origin).toString();
}

export default function ProductJsonLd({ product }: { product: Product }) {
  const price = productPrice(product.inventory);
  const description =
    stripHtml(product.summary) ||
    stripHtml(product.description).slice(0, 500) ||
    `Producto ${product.name} en ${SITE_NAME}`;

  const images = [
    product.image_url,
    ...(product.images ?? []).map((img) => img.image_url),
  ].filter(Boolean) as string[];

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    sku: String(product.id),
    brand: product.brand_label
      ? { "@type": "Brand", name: product.brand_label }
      : undefined,
    category: product.category_label || product.category_slug,
    url: absoluteUrl(
      typeof window !== "undefined"
        ? window.location.pathname
        : `/productos/${product.category_slug}/${product.subcategory_slug || "All"}/${product.slug}`,
    ),
    image: images.length ? images : undefined,
  };

  if (price !== null && product.inventory) {
    const currency =
      product.inventory.money === "Bo" || product.inventory.money === "Bs"
        ? "BOB"
        : product.inventory.money;
    data.offers = {
      "@type": "Offer",
      priceCurrency: currency,
      price: String(price),
      availability:
        product.inventory.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: data.url,
      seller: { "@type": "Organization", name: SITE_NAME },
    };
  }

  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
    </Head>
  );
}
