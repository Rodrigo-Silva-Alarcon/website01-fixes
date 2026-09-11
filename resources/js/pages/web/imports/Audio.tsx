import svgPaths from "./svg-lbkuw7p9k4";
import { img } from "./svg-6a417";

function Frame388() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-center relative shrink-0">
      <div className="relative shrink-0 size-[24px]" data-name="speaker">
        <div className="absolute inset-[10.42%_22.92%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-5.5px_-2.5px] mask-size-[24px_24px]" data-name="speaker" style={{ maskImage: `url('${img}')` }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 19">
            <path d={svgPaths.p39c2cc00} fill="var(--fill-0, #191C1F)" id="speaker" />
          </svg>
        </div>
      </div>
      <p className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Barras de sonido
      </p>
    </div>
  );
}

function Frame391() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-center relative shrink-0">
      <div className="relative shrink-0 size-[24px]" data-name="headphones">
        <div className="absolute inset-[14.583%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3.5px] mask-size-[24px_24px]" data-name="headphones" style={{ maskImage: `url('${img}')` }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
            <path d={svgPaths.p1aafef10} fill="var(--fill-0, #191C1F)" id="headphones" />
          </svg>
        </div>
      </div>
      <p className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Auriculares y audifonos
      </p>
    </div>
  );
}

export default function Audio() {
  return (
    <div className="bg-[#f2f4f5] relative rounded-[10px] size-full" data-name="Audio">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-start p-[20px] relative size-full">
          <Frame388 />
          <Frame391 />
        </div>
      </div>
    </div>
  );
}