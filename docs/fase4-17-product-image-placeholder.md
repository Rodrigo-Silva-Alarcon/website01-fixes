# Fase 4-17 — Placeholder para imágenes de producto rotas (§4.7.2)

## Problema

Productos con `image` en BD pero archivo ausente devolvían URL 404 → icono de imagen rota del navegador.

## Cambios

| Archivo | Cambio |
|---|---|
| `public/images/product-placeholder.svg` | SVG placeholder "Sin imagen" |
| `resources/js/components/ResponsiveImg.tsx` | `src` nulo o `onError` → placeholder; sin más `return null` |
| `app/Models/Product.php` | `image_url` / thumbs / webp solo si `is_file(public_path(...))` |
| `resources/js/pages/web/ProductDetailPage.tsx` | Galería, miniaturas y cards relacionadas con `ResponsiveImg` |
| `tests/Feature/StorefrontTest.php` | Test: imagen inexistente → `image_url`/`image_webp_url` null |

## Verificación

- `artisan test --compact` → **103 passed (534 assertions)**
- `npx tsc --noEmit` → OK
- `npx eslint` → 0 errores

## Commit

`fix(web): placeholder para imágenes de producto faltantes (Fase 4)`
