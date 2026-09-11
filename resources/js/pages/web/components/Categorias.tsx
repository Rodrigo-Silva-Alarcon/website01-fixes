import { Category } from "@/types/models";
import { Link, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

function ItemCategory({category}:{category:Category}) {
  return (
    <Link 
      href={ route('category', {category:category.slug}) } 
      className="interactive-card basis-0 bg-[#e0eef3] hover:bg-[#cae6f0] grow min-h-px min-w-[100px] relative rounded-[20px] shrink-0" 
      data-name="Category">

      <div className="flex flex-col items-center justify-center min-w-inherit size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-center justify-center min-w-inherit p-[20px] relative w-full">
          <div className="aspect-[148/148] relative shrink-0 w-full" data-name="Image">
            <img alt="" className="absolute inset-0 max-w-none mix-blend-multiply object-50%-50% object-contain pointer-events-none size-full" src={category.image_url} />
          </div>
          <p className="[white-space-collapse:collapse] font-dm_sans font-normal leading-[24px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#191c1f] text-[16px] text-center text-nowrap w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
            {category.name}
          </p>
        </div>
      </div>
    </Link>
  );
}


export default function Categorias() {
  
  const { categorias } = usePage<{ categorias: Category[] }>().props;

  return (
    <div className="relative size-full" data-name="Marcas">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[32px] md:gap-[64px] items-start px-[16px] sm:px-[32px] md:px-[64px] py-[40px] md:py-[80px] relative size-full">
          <p className="font-dm_sans font-bold leading-[1.1] relative shrink-0 text-[#191c1f] text-[28px] sm:text-[32px] md:text-[39px] text-center w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
            Categorías
          </p>
          <div className="content-center grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-[12px] md:gap-[16px] items-center relative shrink-0 w-full">
            {categorias.map((category, index) => (   
              <ItemCategory 
                key={category.id}
                category={category} 
                />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}