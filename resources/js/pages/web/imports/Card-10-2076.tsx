import svgPaths from "./svg-u06qhp5wqz";
import img1 from "@/pages/web/assets/f67941a6e6fe06f3ff4f695f1016d10947bb8097.png";
import { img } from "./svg-n8p6r";

function Frame48095438() {
  return (
    <div className="content-start flex flex-wrap font-dm_sans font-normal gap-[8px] items-start leading-[24px] relative shrink-0 text-[16px] text-nowrap w-full whitespace-pre">
      <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid line-through relative shrink-0 text-[#fa8232]" style={{ fontVariationSettings: "'opsz' 14" }}>
        Bs. 210.00
      </p>
      <p className="relative shrink-0 text-[#191c1f]" style={{ fontVariationSettings: "'opsz' 14" }}>
        Bs. 150.00
      </p>
    </div>
  );
}

function Frame10124030() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <p className="-webkit-box font-dm_sans font-bold leading-[25px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#191c1f] text-[20px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        Nombre de producto 1 con ejemplo de un nombre largo
      </p>
      <Frame48095438 />
    </div>
  );
}

function Frame10124095() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <div className="relative shrink-0 size-[20px]" data-name="shopping_cart">
        <div className="absolute inset-[9.38%_15.53%_10.18%_6.25%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.5px_-2.25px] mask-size-[24px_24px]" data-name="shopping_cart" style={{ maskImage: `url('${img}')` }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 17">
            <path d={svgPaths.p3d5d4700} fill="var(--fill-0, #191C1F)" id="shopping_cart" />
          </svg>
        </div>
      </div>
      <p className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Añadir al carrito
      </p>
    </div>
  );
}

export default function Card() {
  return (
    <div className="bg-[#f2f4f5] relative rounded-[16px] shadow-[0px_6px_10px_4px_rgba(0,0,0,0.15),0px_2px_3px_0px_rgba(0,0,0,0.3)] size-full" data-name="Card">
      <div className="min-w-inherit size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-start min-w-inherit overflow-clip p-[20px] relative size-full">
          <div className="aspect-[264/264] relative shrink-0 w-full" data-name="image 10">
            <img alt="" className="absolute inset-0 max-w-none mix-blend-multiply object-50%-50% object-contain pointer-events-none size-full" src={img1} />
          </div>
          <div className="h-0 relative shrink-0 w-full">
            <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 264 1">
                <line id="Line 6" stroke="var(--stroke-0, #191C1F)" strokeWidth="0.5" x2="264" y1="0.25" y2="0.25" />
              </svg>
            </div>
          </div>
          <Frame10124030 />
          <div className="box-border content-stretch flex flex-col gap-[4px] items-center justify-center px-0 py-[4px] relative shrink-0 w-full" data-name="Botón1">
            <Frame10124095 />
          </div>
        </div>
      </div>
    </div>
  );
}