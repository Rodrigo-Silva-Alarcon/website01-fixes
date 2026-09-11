import svgPaths from "./svg-t5n5xgggf3";
import { img } from "./svg-n5ydv";

function Frame384() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-center relative shrink-0">
      <div className="relative shrink-0 size-[24px]" data-name="kitchen">
        <div className="absolute inset-[10.42%_18.75%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-4.5px_-2.5px] mask-size-[24px_24px]" data-name="kitchen" style={{ maskImage: `url('${img}')` }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 19">
            <path d={svgPaths.p28227d80} fill="var(--fill-0, #191C1F)" id="kitchen" />
          </svg>
        </div>
      </div>
      <p className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Refrigeradores
      </p>
    </div>
  );
}

function Frame390() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-center relative shrink-0">
      <div className="relative shrink-0 size-[24px]" data-name="oven_gen">
        <div className="absolute inset-[14.583%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3.5px] mask-size-[24px_24px]" data-name="oven_gen" style={{ maskImage: `url('${img}')` }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
            <path d={svgPaths.pa120900} fill="var(--fill-0, #191C1F)" id="oven_gen" />
          </svg>
        </div>
      </div>
      <p className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Hornos
      </p>
    </div>
  );
}

function Frame392() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-center relative shrink-0">
      <div className="relative shrink-0 size-[24px]" data-name="microwave_gen">
        <div className="absolute inset-[18.75%_10.42%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2.5px_-4.5px] mask-size-[24px_24px]" data-name="microwave_gen" style={{ maskImage: `url('${img}')` }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 15">
            <path d={svgPaths.pfff8d00} fill="var(--fill-0, #191C1F)" id="microwave_gen" />
          </svg>
        </div>
      </div>
      <p className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Microondas
      </p>
    </div>
  );
}

export default function Cocina() {
  return (
    <div className="bg-[#f2f4f5] relative rounded-[10px] size-full" data-name="Cocina">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-start p-[20px] relative size-full">
          <Frame384 />
          <Frame390 />
          <Frame392 />
        </div>
      </div>
    </div>
  );
}