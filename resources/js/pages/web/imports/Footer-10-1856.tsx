import svgPaths from "./svg-3m2zodg2fw";
import AppLogoIcon from '@/components/app-logo-icon';
import { img } from "./svg-ksqrv";

function Frame10124034() {
  return (
    <div className="basis-0 content-center flex flex-wrap gap-[16px] grow items-center justify-center min-h-px min-w-[300px] relative shrink-0">
      <div className="bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" data-name="Botón">
        <div className="relative shrink-0 size-[20px]" data-name="WhatsApp">
          <div className="absolute bottom-0 left-0 right-[0.47%] top-0" data-name="Vector">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <path d={svgPaths.p3190a280} fill="var(--fill-0, white)" id="Vector" />
            </svg>
          </div>
        </div>
        <p className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
          WhatsApp
        </p>
      </div>
      <div className="bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" data-name="Botón">
        <div className="relative shrink-0 size-[20px]" data-name="mail">
          <div className="absolute inset-[20%_10%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2px_-4px] mask-size-[20px_20px]" data-name="mail" style={{ maskImage: `url('${img}')` }}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 12">
              <path d={svgPaths.p10cf0780} fill="var(--fill-0, white)" id="mail" />
            </svg>
          </div>
        </div>
        <p className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
          Correo
        </p>
      </div>
      <div className="bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" data-name="Botón">
        <div className="relative shrink-0 size-[20px]" data-name="location_on">
          <div className="absolute inset-[10%_17.5%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3.5px_-2px] mask-size-[20px_20px]" data-name="location_on" style={{ maskImage: `url('${img}')` }}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 16">
              <path d={svgPaths.p34656280} fill="var(--fill-0, white)" id="location_on" />
            </svg>
          </div>
        </div>
        <p className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
          Ubicación
        </p>
      </div>
      <div className="bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" data-name="Botón">
        <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Facebook">
          <div className="absolute bottom-[0.37%] left-0 right-0 top-0" data-name="Vector">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <path d={svgPaths.p4cffe00} fill="var(--fill-0, white)" id="Vector" />
            </svg>
          </div>
        </div>
        <p className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
          Facebook
        </p>
      </div>
    </div>
  );
}

function Frame10124036() {
  return (
    <div className="basis-0 content-start flex flex-wrap gap-[32px] grow items-start justify-end min-h-px min-w-[300px] relative shrink-0">
      <Frame10124034 />
    </div>
  );
}

function Frame10124037() {
  return (
    <div className="content-center flex flex-wrap gap-[80px] items-center relative shrink-0 w-full">
      <div className="h-[80px] relative shrink-0 w-[236.992px]" data-name="Logo" style={{ color: "white" }}>
        <div className="absolute inset-0" data-name="image 9">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <AppLogoIcon className="h-full w-full" />
          </div>
        </div>
      </div>
      <Frame10124036 />
    </div>
  );
}

function Frame10124038() {
  return (
    <div className="box-border content-start flex flex-wrap gap-[20px] items-start px-0 py-[20px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#cacccd] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <p className="basis-0 font-dm_sans font-normal grow leading-[20px] min-h-px min-w-[300px] relative shrink-0 text-[#cacccd] text-[14px]" style={{ fontVariationSettings: "'opsz' 14" }}>
        © Smart House, 2025. Todos los derechos reservados.
      </p>
      <p className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#cacccd] text-[14px] text-nowrap text-right whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
        Desarrollado por MegaLink S.R.L.
      </p>
    </div>
  );
}

export default function Footer() {
  return (
    <div className="bg-[#191c1f] relative size-full" data-name="Footer">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[64px] items-center pb-0 pt-[64px] px-[64px] relative size-full">
          <Frame10124037 />
          <Frame10124038 />
        </div>
      </div>
    </div>
  );
}