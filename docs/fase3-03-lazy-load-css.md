# Fix 30 — Lazy load en imágenes de producto + CSS duplicado (Fase 3)

## Problema

- `analisis-website01.md` §4.2.3: imágenes sin `loading="lazy"` → el navegador descarga todo el catálogo en el primer paint (mayor payload, LCP/FCP rojos en §4.2.6).
- §4.2.5: `globals.css` importado **dos veces** en `HomePage.tsx`.

## Solución

### Lazy load (`loading="lazy"`)

Añadido a las `<img>` de catálogo/listado en vivo:

- `ProductosPage.tsx` (cards de listado)
- `ProductDetailPage.tsx` (relacionados)
- `FindProductsPage.tsx`
- `components/Ofertas.tsx`
- `imports/BlockCategory.tsx`
- `components/Marcas.tsx` (logos)
- `components/Categorias.tsx` (iconos de categoría)

Se omite en hero/banner LCP above-the-fold (deben seguir siendo eager).

### CSS duplicado

`HomePage.tsx`: eliminado el segundo `import "@/pages/web/styles/globals.css"` (línea 13); se conserva el de la línea 1.

## Archivos modificados

- `resources/js/pages/web/HomePage.tsx`
- `resources/js/pages/web/ProductosPage.tsx`
- `resources/js/pages/web/ProductDetailPage.tsx`
- `resources/js/pages/web/FindProductsPage.tsx`
- `resources/js/pages/web/components/Ofertas.tsx`
- `resources/js/pages/web/components/Marcas.tsx`
- `resources/js/pages/web/components/Categorias.tsx`
- `resources/js/pages/web/imports/BlockCategory.tsx`

## Verificación

- `npx tsc --noEmit` → 0 errores.
- `npx eslint` (8 archivos) → 0 errores (warnings pre-existentes).
- `artisan test --compact` → **86/86**.

## Fases

**Fase 3 (rendimiento / calidad)** — `analisis-website01.md` §4.2.3 (lazy), §4.2.5.

Nota: conversión WebP + `<picture>`/srcset queda pendiente como item aparte (§4.2.3 completa).
