import svgPaths from "./svg-be9yg1hs79";
import { img } from "./svg-54t52";

function Frame393() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-center relative shrink-0">
      <div className="relative shrink-0 size-[24px]" data-name="local_laundry_service">
        <div className="absolute inset-[10.42%_18.75%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-4.5px_-2.5px] mask-size-[24px_24px]" data-name="local_laundry_service" style={{ maskImage: `url('${img}')` }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 19">
            <path d={svgPaths.p22480980} fill="var(--fill-0, #191C1F)" id="local_laundry_service" />
          </svg>
        </div>
      </div>
      <p className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Lavadoras
      </p>
    </div>
  );
}

function Frame394() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-center relative shrink-0">
      <div className="relative shrink-0 size-[24px]" data-name="windshield_heat_front">
        <div className="absolute inset-[12.17%_5.64%_18.75%_5.71%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.369px_-2.921px] mask-size-[24px_24px]" data-name="windshield_heat_front" style={{ maskImage: `url('${img}')` }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 17">
            <path d={svgPaths.pde91c00} fill="var(--fill-0, #191C1F)" id="windshield_heat_front" />
          </svg>
        </div>
      </div>
      <p className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Estufas
      </p>
    </div>
  );
}

export default function Electrodomesticos() {
  return (
    <div className="bg-[#f2f4f5] relative rounded-[10px] size-full" data-name="Electrodomésticos">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-start p-[20px] relative size-full">
          <Frame393 />
          <Frame394 />
        </div>
      </div>
    </div>
  );
}