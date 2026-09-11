import svgPaths from "./svg-83d4yq5gr8";
import { img } from "./svg-k80sv";

function Texto() {
  return (
    <div className="basis-0 content-stretch flex gap-[16px] grow items-center justify-center min-h-px min-w-px relative shrink-0" data-name="Texto">
      <div className="relative shrink-0 size-[20px]" data-name="savings">
        <div className="absolute inset-[10%_10%_15%_10%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2px] mask-size-[20px_20px]" data-name="savings" style={{ maskImage: `url('${img}')` }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 15">
            <path d={svgPaths.p2cd3d900} fill="var(--fill-0, white)" id="savings" />
          </svg>
        </div>
      </div>
      <p className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Promociones y descuentos exclusivos
      </p>
    </div>
  );
}

export default function Info() {
  return (
    <div className="bg-[#006696] relative size-full" data-name="Info">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[80px] items-center px-[32px] py-[8px] relative size-full">
          <div className="relative shrink-0 size-[20px]" data-name="chevron_backward">
            <div className="absolute bottom-1/4 left-[35%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-7px_-5px] mask-size-[20px_20px] right-[34.69%] top-1/4" data-name="chevron_backward" style={{ maskImage: `url('${img}')` }}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 10">
                <path d={svgPaths.p22a1e500} fill="var(--fill-0, white)" id="chevron_backward" />
              </svg>
            </div>
          </div>
          <Texto />
          <div className="relative shrink-0 size-[20px]" data-name="chevron_forward">
            <div className="absolute bottom-1/4 left-[34.69%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-6.938px_-5px] mask-size-[20px_20px] right-[35%] top-1/4" data-name="chevron_forward" style={{ maskImage: `url('${img}')` }}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 10">
                <path d={svgPaths.p22a1e500} fill="var(--fill-0, white)" id="chevron_backward" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}