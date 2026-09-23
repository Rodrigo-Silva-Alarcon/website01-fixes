# Fix 33 — Imágenes WebP + picture responsive (Fase 3)

## Problema

`analisis-website01.md` §4.2.3: las imágenes de products/categories/banners se servían solo en PNG/JPG (~21 MB en `public/data`), sin variante WebP ni `<picture>` con fallback.

## Solución

### Backend

1. **`PostTrait::processImage()`** — al guardar la imagen y el thumbnail, genera también la variante `.webp` (quality 82) best-effort (si falla, la original queda intacta).
2. **`artisan images:webp`** (`app/Console/Commands/ConvertImagesWebp.php`) — convierte en bulk `public/data/{products,categories,banners,texts}`; omite existentes salvo `--force`.
3. **Accessors `image_webp_url`** en `Product`, `Category`, `Banner`, `Brand` — solo devuelven URL si el archivo `.webp` existe en disco (`null` si no), y se añaden a `$appends` para que viajen en JSON de Inertia.

> Nota de entorno: el PHP local de herd-lite no compila GD con WebP/JPEG. La conversión masiva de los 265 assets existentes se hizo con `sharp` (`scripts/convert-webp-once.cjs`, one-shot, `--no-save` — no altera `package.json`). En el servidor de producción, `images:webp` funciona si el GD tiene WebP; si no, se puede reutilizar el mismo script Node.

### Frontend

4. **`components/ResponsiveImg.tsx`** — wrapper `<picture>`: `<source type="image/webp">` + `<img>` fallback.
5. Cards y grids con `webpSrc`:
   - `ProductosPage` (catálogo)
   - `Ofertas` (home ofertas)
   - `BlockCategory` (home por categoría)
   - `Categorias` (home categorías)
   - `Marcas` (home marcas)
6. **`types/models.ts`** — `image_webp_url?: string | null` en Product, Category, Banner, Brand.

## Archivos modificados

- `app/Traits/PostTrait.php`
- `app/Console/Commands/ConvertImagesWebp.php` (nuevo)
- `app/Models/{Product,Category,Banner,Brand}.php`
- `resources/js/components/ResponsiveImg.tsx` (nuevo)
- `resources/js/pages/web/{ProductosPage,components/Ofertas,components/Categorias,components/Marcas,imports/BlockCategory}.tsx`
- `resources/js/types/models.ts`
- `scripts/convert-webp-once.cjs` (nuevo, one-shot)
- `public/data/**` — 265 `.webp` generados

## Verificación

- `node scripts/convert-webp-once.cjs` → `converted=265 failed=0 webp_total=265`
- `tinker`: `image_webp_url` devuelve URL existente para un Product con imagen.
- `npx tsc --noEmit` → 0 errores.
- `artisan test --compact` → **86/86**.
- `eslint` en archivos tocados → 0 errores (solo warnings preexistentes).

## Fases

**Fase 3 (calidad / rendimiento)** — `analisis-website01.md` §4.2.3.
