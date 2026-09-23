import svgPaths from "@/pages/web/imports/svg-3m2zodg2fw";
import AppLogoIcon from '@/components/app-logo-icon';
import { img } from "@/pages/web/imports/svg-ksqrv";
import { usePage } from "@inertiajs/react";

export default function Footer() {
  const { cmsTexts } = usePage<{ cmsTexts?: Record<string, string> }>().props;
  const texts = cmsTexts ?? {};
  const whatsappRaw = texts.footer_whatsapp?.replace(/[^\d]/g, "") ?? "";
  const whatsappHref = whatsappRaw ? `https://wa.me/${whatsappRaw}` : "";
  const emailHref = texts.footer_email ? `mailto:${texts.footer_email}` : "";
  const mapsHref = texts.footer_maps ?? "";
  const facebookHref = texts.footer_facebook ?? "";
  const address = texts.footer_address ?? "";

  return (
    <footer className="bg-[#191c1f] relative w-full" data-name="Footer">
      <div className="flex flex-col items-center w-full">
        <div className="box-border content-stretch flex flex-col gap-[32px] md:gap-[64px] items-center pb-0 pt-[32px] md:pt-[64px] px-[16px] sm:px-[32px] md:px-[64px] relative w-full">
          {/* Logo y Botones */}
          <div className="content-center flex flex-col md:flex-row flex-wrap gap-[32px] md:gap-[80px] items-center justify-between relative w-full">
            {/* Logo */}
            <div className="h-[60px] md:h-[80px] relative shrink-0 w-[177.744px] md:w-[236.992px]" data-name="Logo" style={{ color: "white" }}>
              <div className="absolute inset-0" data-name="image 9">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <AppLogoIcon className="h-full w-full" />
                </div>
              </div>
            </div>

            {/* Botones de Contacto */}
            <div className="content-start flex flex-wrap gap-[12px] md:gap-[16px] items-center justify-center md:justify-end">
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="interactive-button bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] rounded-[40px] hover:bg-[#e67528] transition-colors cursor-pointer"
                >
                  <div className="relative shrink-0 size-[20px]" data-name="WhatsApp">
                    <div className="absolute bottom-0 left-0 right-[0.47%] top-0" data-name="Vector">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                        <path d={svgPaths.p3190a280} fill="var(--fill-0, white)" />
                      </svg>
                    </div>
                  </div>
                  <p className="font-dm_sans font-normal leading-[24px] text-[16px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
                    WhatsApp
                  </p>
                </a>
              )}

              {emailHref && (
                <a
                  href={emailHref}
                  className="interactive-button bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] rounded-[40px] hover:bg-[#e67528] transition-colors cursor-pointer"
                >
                  <div className="relative shrink-0 size-[20px]" data-name="mail">
                    <div className="absolute inset-[20%_10%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2px_-4px] mask-size-[20px_20px]" data-name="mail" style={{ maskImage: `url('${img}')` }}>
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 12">
                        <path d={svgPaths.p10cf0780} fill="var(--fill-0, white)" />
                      </svg>
                    </div>
                  </div>
                  <p className="font-dm_sans font-normal leading-[24px] text-[16px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
                    Correo
                  </p>
                </a>
              )}

              {mapsHref && (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="interactive-button bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] rounded-[40px] hover:bg-[#e67528] transition-colors cursor-pointer"
                >
                  <div className="relative shrink-0 size-[20px]" data-name="location_on">
                    <div className="absolute inset-[10%_17.5%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3.5px_-2px] mask-size-[20px_20px]" data-name="location_on" style={{ maskImage: `url('${img}')` }}>
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 16">
                        <path d={svgPaths.p34656280} fill="var(--fill-0, white)" />
                      </svg>
                    </div>
                  </div>
                  <p className="font-dm_sans font-normal leading-[24px] text-[16px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
                    Ubicación
                  </p>
                </a>
              )}

              {facebookHref && (
                <a
                  href={facebookHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="interactive-button bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] rounded-[40px] hover:bg-[#e67528] transition-colors cursor-pointer"
                >
                  <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Facebook">
                    <div className="absolute bottom-[0.37%] left-0 right-0 top-0" data-name="Vector">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                        <path d={svgPaths.p4cffe00} fill="var(--fill-0, white)" />
                      </svg>
                    </div>
                  </div>
                  <p className="font-dm_sans font-normal leading-[24px] text-[16px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
                    Facebook
                  </p>
                </a>
              )}
            </div>
          </div>

          {/* Copyright */}
          <div className="box-border content-start flex flex-col md:flex-row flex-wrap gap-[12px] md:gap-[20px] items-start md:items-center justify-between px-0 py-[20px] relative w-full border-t border-[#cacccd]">
            <p className="font-dm_sans font-normal leading-[20px] text-[#cacccd] text-[14px] text-center md:text-left w-full md:w-auto" style={{ fontVariationSettings: "'opsz' 14" }}>
              © Smart House, {new Date().getFullYear()}. Todos los derechos reservados.
            </p>
            {address && (
              <p className="font-dm_sans font-normal leading-[20px] text-[#cacccd] text-[14px] text-center w-full md:w-auto" style={{ fontVariationSettings: "'opsz' 14" }}>
                {address}
              </p>
            )}
            <p className="font-dm_sans font-normal leading-[20px] text-[#cacccd] text-[14px] text-center md:text-right w-full md:w-auto whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
              Desarrollado por MegaLink S.R.L.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
