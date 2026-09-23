# Fix 19 — Alt texts descriptivos en imágenes del storefront (Fase 2)

## Problema

La mayoría de `<img>` del storefront usaban `alt=""` (incluso en producto/categoría), lo que rompe accesibilidad (lectores de pantalla) y SEO de imágenes. Solo algunos ya tenían texto (logo About, marcas, banners de héroe).

## Solución

Asignar `alt` con el nombre del recurso en componentes **en uso** (home, catálogo, detalle, carrito):

| Archivo | `alt` |
|---|---|
| `ProductosPage.tsx` (card) | `product.name` |
| `Ofertas.tsx` (populares) | `product.name` |
| `Banner.tsx` (destacados ×2) | `product.name` |
| `Categorias.tsx` | `category.name` |
| `Carrito.tsx` (línea + recomendado) | `item.name` / `producto.name` |
| `BlockCategory.tsx` | `product.name` |
| `ProductDetailPage.tsx` (relacionados) | `product.name` |
| `FindProductsPage.tsx` (mock) | `producto.nombre` |

No se tocaron archivos Figma legacy muertos (`imports/Ofertas-*`, `Frame10124093`, etc.) para no inflar el diff.

## Archivos modificados

- `resources/js/pages/web/ProductosPage.tsx`
- `resources/js/pages/web/components/Ofertas.tsx`
- `resources/js/pages/web/components/Banner.tsx`
- `resources/js/pages/web/components/Categorias.tsx`
- `resources/js/pages/web/imports/Carrito.tsx`
- `resources/js/pages/web/imports/BlockCategory.tsx`
- `resources/js/pages/web/ProductDetailPage.tsx`
- `resources/js/pages/web/FindProductsPage.tsx`

## Verificación

- `npx tsc --noEmit` → 0 errores.
- Grep `alt=""` en los 8 archivos en uso → **0** coincidencias.

## Fases

**Fase 2 (SEO / alt texts)** — `analisis-website01.md` §7: batch replace.
