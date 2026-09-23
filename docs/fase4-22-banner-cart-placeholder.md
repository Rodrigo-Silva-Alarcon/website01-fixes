# Fase 4-22 — Placeholder en Banner y carrito (F4-17 extensión)

## Problema

`Banner.tsx` y `Carrito.tsx` aún usaban `<img>` crudo con `image_url` (que puede ser `null` tras F4-17 si el archivo no existe) o condicionales `image_url &&` que dejaban el contenedor vacío.

## Cambios

| Archivo | Cambio |
|---|---|
| `resources/js/pages/web/components/Banner.tsx` | 2× `<img>` → `ResponsiveImg` con `webpSrc`; eliminado guard `image_url &&` |
| `resources/js/pages/web/imports/Carrito.tsx` | 3× `<img>` → `ResponsiveImg` (offcanvas desktop/mobile + card carrito) |

## Verificación

- `artisan test --compact` → **105 passed (577 assertions)**
- `npx tsc --noEmit` → OK
- `npx eslint Banner.tsx Carrito.tsx` → 0 errores

## Commit

`fix(web): placeholder de imagen en banner y carrito (Fase 4)`
