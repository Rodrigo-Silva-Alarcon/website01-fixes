# Fase 4-13 — Formulario crear producto (§4.7.15)

## Problema

1. Label en inglés **"Product"** en el campo nombre.
2. Imágenes redimensionadas a **800px** de ancho (insuficiente para zoom).
3. Texto de ayuda de la galería podía truncarse.

## Cambios

| Archivo | Cambio |
|---|---|
| `resources/js/pages/admin/products/_form.tsx` | Label `Product` → `Producto`; textos de ayuda → "máximo de 1200px de ancho"; `whitespace-normal break-words` en el pie de la galería |
| `app/Http/Controllers/Admin/ProductController.php` | `configureImages(..., 1200, NULL, ...)` (antes 800) |

`scale(1200, null)` de Intervention mantiene proporción y limita el ancho máximo a 1200px.

## Verificación

- `artisan test --compact` → **98 passed (460 assertions)**
- `npx tsc --noEmit` → OK
- `npx eslint _form.tsx` → 0 errores (warnings preexistentes)

## Commit

`fix(products): label en español e imagen hasta 1200px (Fase 4)`
