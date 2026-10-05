import { usePage } from "@inertiajs/react";

interface LogoSource {
  src: string;
  fallback: string | null;
}

export interface FooterContent {
  logo: {
    light: LogoSource;
    /** Versión para modo oscuro; null si no hay o si el logo es transparente (no se cambia) */
    dark: LogoSource | null;
    /** La pastilla del logo sigue el tema (logo transparente o con versión oscura) */
    themed: boolean;
    alt: string;
  };
  copyright: string;
  credits: string | null;
}

const DEFAULT_FOOTER: FooterContent = {
  logo: { light: { src: "/images/logo-smarthouse.png", fallback: null }, dark: null, themed: false, alt: "Smart House Importaciones SRL" },
  copyright: "© Smart House, {año}. Todos los derechos reservados.",
  credits: "Desarrollado por MegaLink S.R.L.",
};

/** Contenido del footer editable en Admin › Footer. */
export function useFooterContent(): FooterContent {
  const { footer } = usePage<{ footer?: FooterContent | null }>().props;
  return footer ?? DEFAULT_FOOTER;
}

/** Reemplaza {año} por el año actual. */
export const withYear = (text: string) => text.replace(/\{a[ñn]o\}/gi, String(new Date().getFullYear()));

function LogoPicture({ source, alt, className }: { source: LogoSource; alt: string; className: string }) {
  return (
    <picture className={className}>
      {source.fallback && <source srcSet={source.src} type="image/webp" />}
      <img
        loading="lazy"
        decoding="async"
        src={source.fallback ?? source.src}
        alt={alt}
        className="block h-[56px] md:h-[72px] w-auto object-contain"
      />
    </picture>
  );
}

/**
 * Logo del footer. Con versión oscura se dibujan ambas y el CSS (storefront-dark.css)
 * muestra la que corresponde a `html.sf-dark`: el cambio es instantáneo, sin parpadeo
 * ni diferencias entre el HTML del servidor y el navegador. La imagen oculta no se
 * descarga gracias a loading="lazy".
 */
export default function FooterLogo() {
  const { logo } = useFooterContent();

  return (
    <div
      className="bg-white border border-[#eceef0] rounded-[12px] px-[14px] py-[10px] shrink-0"
      data-name="Logo"
      data-logo-themed={logo.themed ? "" : undefined}
    >
      <LogoPicture source={logo.light} alt={logo.alt} className={logo.dark ? "footer-logo-light" : "block"} />
      {logo.dark && <LogoPicture source={logo.dark} alt={logo.alt} className="footer-logo-dark" />}
    </div>
  );
}
