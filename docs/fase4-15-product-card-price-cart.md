# Fase 4-15 — Precio y "Añadir al carrito" en tarjetas (§4.7.13)

## Problema

Las tarjetas de listado (`ProductosPage`, `RelatedProductCard`) mostraban solo imagen + nombre; no había botón de compra y las relacionadas no mostraban precio.

## Cambios

| Archivo | Cambio |
|---|---|
| `resources/js/pages/web/components/AddToCartButton.tsx` | Nuevo componente: `POST /addshop/{product}` + icono carrito |
| `resources/js/pages/web/ProductosPage.tsx` | `ProductCard`: Link solo envuelve imagen/nombre/precio; botón fuera del link |
| `resources/js/pages/web/ProductDetailPage.tsx` | `RelatedProductCard`: precio real con `<Price>` + botón |
| `tests/Feature/StorefrontTest.php` | Test: listing incluye `inventory.amount`/`money` para el precio |

## Verificación

- `artisan test --compact` → **101 passed (505 assertions)**
- `npx tsc --noEmit` → OK
- `npx eslint` → 0 errores (warnings preexistentes)

## Commit

`feat(web): precio y añadir al carrito en tarjetas de producto (Fase 4)`
