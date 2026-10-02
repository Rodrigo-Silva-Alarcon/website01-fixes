import { Product } from "@/types/models";
import svgPaths from "@/pages/web/imports/svg-o54k4pn05p";
import { img as maskImg } from "@/pages/web/imports/svg-nochp";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";

export default function AddToCartButton({ product }: { product: Product }) {
  const stock = product.inventory?.stock ?? 0;
  const isOutOfStock = stock <= 0;

  if (isOutOfStock) {
    return (
      <div
        className="content-stretch flex gap-[6px] items-center relative shrink-0 w-full py-[4px] select-none"
        aria-label="Producto agotado"
      >
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">
          Agotado
        </span>
        <span
          className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#71767b] text-[13px] text-nowrap whitespace-pre"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          Sin stock disponible
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        router.post(route("addshop", { product: product.id }), {}, { preserveScroll: true })
      }
      className="content-stretch flex gap-[4px] items-center relative shrink-0 cursor-pointer w-full py-[4px]"
      aria-label={`Añadir ${product.name} al carrito`}
    >
      <div className="relative shrink-0 size-[20px]" data-name="shopping_cart">
        <div
          className="absolute inset-[9.38%_15.53%_10.18%_6.25%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.5px_-2.25px] mask-size-[24px_24px]"
          data-name="shopping_cart"
          style={{ maskImage: `url('${maskImg}')` }}
        >
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 17">
            <path d={svgPaths.p3d5d4700} fill="var(--fill-0, #191C1F)" id="shopping_cart" />
          </svg>
        </div>
      </div>
      <div
        className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre hover:text-orange-600"
        style={{ fontVariationSettings: "'opsz' 14" }}
      >
        Añadir al carrito
      </div>
    </button>
  );
}
