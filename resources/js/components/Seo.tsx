import { Head, usePage } from "@inertiajs/react";

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SITE_NAME = "SmartHouse";
const DEFAULT_DESCRIPTION =
  "SmartHouse - Tecnología y electrodomésticos para tu hogar. Encuentra productos de marcas líderes con los mejores precios.";
const DEFAULT_IMAGE = "/apple-touch-icon.png";

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
}: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const pageOnlyTitle = title || SITE_NAME;
  // En SSR no hay window: el origen llega en la configuración de Ziggy
  const page = usePage<{ ziggy?: { url?: string } }>();
  const origin = typeof window !== "undefined" ? window.location.origin : (page.props.ziggy?.url ?? "");
  const canonical = url ?? `${origin}${page.url}`;

  return (
    <Head>
      <title>{pageOnlyTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
