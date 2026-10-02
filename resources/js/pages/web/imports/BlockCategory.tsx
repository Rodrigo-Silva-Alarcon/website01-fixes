import { Fragment, ReactNode } from "react";
import { Category } from "@/types/models";
import { Link, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/pages/web/components/ProductCard";
import Reveal from "@/pages/web/components/Reveal";

const isConsolas = (c: Category) => /consola/i.test(c.name);
const isSonido = (c: Category) => /sonido/i.test(c.name);

/** El bloque promocional va entre "Consolas" y "Equipos de sonido" (en cualquier orden). */
function promoSlotIndex(blocks: Category[]): number {
  for (let i = 0; i < blocks.length - 1; i++) {
    const [a, b] = [blocks[i], blocks[i + 1]];
    if ((isConsolas(a) && isSonido(b)) || (isSonido(a) && isConsolas(b))) return i;
  }
  // Si no están contiguas, después de Consolas; si no existe, después del primer bloque
  const consolas = blocks.findIndex(isConsolas);
  return consolas >= 0 ? consolas : 0;
}

export default function BlockCategory({ promo }: { promo?: ReactNode }) {
  const { categories } = usePage<{ categories: Category[] }>().props;

  const blocks = (categories || []).filter((c) => c.products && c.products.length > 0);

  if (blocks.length === 0) return promo ? <>{promo}</> : null;

  const slot = promoSlotIndex(blocks);

  return (
    <>
      {blocks.map((category, blockIndex) => (
        <Fragment key={category.id}>
          <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-12 md:pt-16 flex flex-col gap-7">
            {/* Cabecera de la Categoría */}
            <Reveal className="flex items-end justify-between gap-4 flex-wrap">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#191c1f]">
                {category.name}
              </h2>
              <Link
                href={route("category", { category: category.slug })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-[#191c1f] text-sm font-semibold text-[#191c1f] transition-all duration-200 hover:bg-[#191c1f] hover:text-white"
              >
                Ver más
                <ArrowRight className="size-4" />
              </Link>
            </Reveal>

            {/* Grid de Productos (4 columnas), aparecen escalonados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.products.slice(0, 4).map((product, index) => (
                <Reveal key={product.id} className="h-full" delay={0.08 * (index + 1)} y={24}>
                  <ProductCard product={product} index={index} />
                </Reveal>
              ))}
            </div>
          </section>

          {promo && blockIndex === slot && promo}
        </Fragment>
      ))}
    </>
  );
}
