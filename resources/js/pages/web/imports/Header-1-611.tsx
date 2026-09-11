import svgPaths from "./svg-npyi3pa09n";
import AppLogoIcon from '@/components/app-logo-icon';
import { img } from "./svg-njpn6";

function Frame10124113() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="bg-white box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" data-name="Botón">
        <div className="relative shrink-0 size-[20px]" data-name="search">
          <div className="absolute inset-[15%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px] mask-size-[20px_20px]" data-name="search" style={{ maskImage: `url('${img}')` }}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
              <path d={svgPaths.p1a72af00} fill="var(--fill-0, #191C1F)" id="search" />
            </svg>
          </div>
        </div>
      </div>
      <div className="bg-white box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" data-name="Botón">
        <div className="relative shrink-0 size-[20px]" data-name="star_shine">
          <div className="absolute inset-[10.42%_7.7%_14.58%_7.7%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.848px_-2.5px] mask-size-[24px_24px]" data-name="star_shine" style={{ maskImage: `url('${img}')` }}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 15">
              <path d={svgPaths.p1f5b98f0} fill="var(--fill-0, #191C1F)" id="star_shine" />
            </svg>
          </div>
        </div>
      </div>
      <div className="bg-white box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" data-name="Botón">
        <div className="relative shrink-0 size-[20px]" data-name="shopping_cart">
          <div className="absolute inset-[9.38%_15.53%_10.18%_6.25%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.5px_-2.25px] mask-size-[24px_24px]" data-name="shopping_cart" style={{ maskImage: `url('${img}')` }}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 17">
              <path d={svgPaths.p3d5d4700} fill="var(--fill-0, #191C1F)" id="shopping_cart" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame10124071() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <div className="h-[40px] relative shrink-0 w-[118.496px]" data-name="Logo" style={{ color: "#191c1f" }}>
        <div className="absolute inset-0" data-name="image 9">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <AppLogoIcon className="h-full w-full" />
          </div>
        </div>
      </div>
      <Frame10124113 />
    </div>
  );
}

export default function Header() {
  return (
    <div className="bg-white relative size-full" data-name="Header">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-start px-[20px] py-[16px] relative size-full">
          <Frame10124071 />
        </div>
      </div>
    </div>
  );
}