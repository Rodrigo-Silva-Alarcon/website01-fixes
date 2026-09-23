# Fix 22 — object-fit en imágenes de producto (Fase 2)

## Problema

Cards de producto en catálogo, relacionados, carrito y búsqueda usaban `object-cover` en contenedores `aspect-square`/`aspect-[264/264]`, recortando el producto (lavadoras cortadas, TV por los bordes). `analisis-website01.md` §4.7.3 / §7 — “Fix recorte/calidad imágenes”.

## Solución

Cambiar `object-cover` → `object-contain` (con `object-50%-50%` y `mix-blend-multiply` donde ya existía) en las imágenes de producto **en uso**, siguiendo el patrón ya correcto de `BlockCategory`/`Ofertas`/`Banner`:

| Archivo | Contexto |
|---|---|
| `ProductosPage.tsx` | card de catálogo |
| `ProductDetailPage.tsx` | productos relacionados |
| `FindProductsPage.tsx` | resultado de búsqueda |
| `imports/Carrito.tsx` | miniatura de línea ×2 + recomendado |

**No se tocó:**

- Hero/banner editorial → sigue `object-cover` (fotografía a sangre, correcto).
- Archivos Figma legacy muertos.
- Subir imágenes de mayor resolución / thumbnails incorrectos en BD → requiere re-upload desde admin (fuera del batch CSS); documentado como pendiente de datos.

## Archivos modificados

- `resources/js/pages/web/ProductosPage.tsx`
- `resources/js/pages/web/ProductDetailPage.tsx`
- `resources/js/pages/web/FindProductsPage.tsx`
- `resources/js/pages/web/imports/Carrito.tsx`

## Verificación

- `npx tsc --noEmit` → 0 errores.
- ESLint en los 4 archivos → 0 errores (warnings preexistentes).
- Grep: sin `object-cover` en cards de producto de esos 4 archivos.

## Fases

**Fase 2 (UX / recorte de imágenes)** — `analisis-website01.md` §4.7.3 y §7.
