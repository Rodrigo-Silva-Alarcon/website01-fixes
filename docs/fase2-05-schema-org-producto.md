# Fix 21 — JSON-LD Product (schema.org) en detalle de producto (Fase 2)

## Problema

No había structured data. Google no podía generar rich snippets (precio, disponibilidad, marca) en resultados de búsqueda. `analisis-website01.md` §4.3.4 / §7 — “Schema.org products”.

## Solución

Nuevo componente `resources/js/components/ProductJsonLd.tsx` que inyecta en `<Head>` un script `application/ld+json` con tipo `Product`:

| Campo | Fuente |
|---|---|
| `name` | `product.name` |
| `description` | `summary` o `description` sin HTML (máx. 500) |
| `sku` | `product.id` |
| `brand` | `brand_label` → `{ @type: Brand }` |
| `category` | `category_label` / `category_slug` |
| `url` | URL actual del detalle |
| `image` | `image_url` + `images[].image_url` |
| `offers` | solo si hay precio: `price`, `priceCurrency` (ISO 4217; `Bo`/`Bs` → `BOB`), `availability` (stock > 0 → `InStock` / `OutOfStock`), `url`, `seller` |

Se monta en `ProductDetailPage` junto al `<Seo>` existente.

## Archivos modificados

- `resources/js/components/ProductJsonLd.tsx` (nuevo)
- `resources/js/pages/web/ProductDetailPage.tsx` (import + `<ProductJsonLd product={product} />`)

## Verificación

- `npx tsc --noEmit` → 0 errores.
- ESLint en ambos archivos → 0 errores (solo warnings preexistentes del page).
- Pest `StorefrontTest` → 14/14.
- Navegador en `/Productos/Electrodomesticos/Refrigeradoras/Refrigeradora-samsung-400l`: script LD+JSON presente y parseado con `@type: Product`, oferta `price: 3299`, `priceCurrency: BOB`, `availability: InStock`.

## Fases

**Fase 2 (SEO / structured data)** — `analisis-website01.md` §4.3.4 y §7.
