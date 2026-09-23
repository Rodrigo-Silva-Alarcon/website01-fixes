# Fase 4-18 — Footer configurable sin placeholders (§4.4.4)

## Problema

Footer hardcodeaba datos placeholder: `https://wa.me/1234567890`, `mailto:info@smarthouse.com`, `https://maps.google.com`, `https://facebook.com`.

## Cambios

| Archivo | Cambio |
|---|---|
| `resources/js/pages/web/components/Footer.tsx` | Botones WhatsApp/Correo/Ubicación/Facebook condicionales a CMS (`footer_whatsapp`, `footer_email`, `footer_maps`, `footer_facebook`); sin fallback placeholder. `footer_address` opcional en copyright. |
| `tests/Feature/CmsTextsTest.php` | Test: 5 claves footer compartidas en `cmsTexts` |

## Claves CMS

| Clave | Uso |
|---|---|
| `footer_whatsapp` | `https://wa.me/{dígitos}` — si vacía, botón oculto |
| `footer_email` | `mailto:{valor}` — si vacía, botón oculto |
| `footer_maps` | URL Google Maps — si vacía, botón oculto |
| `footer_facebook` | URL Facebook — si vacía, botón oculto |
| `footer_address` | Texto dirección en copyright — si vacía, no se muestra |

No se inventan datos reales: el cliente configura desde admin → Textos.

## Verificación

- `artisan test --compact` → **104 passed (553 assertions)**
- `npx tsc --noEmit` → OK
- `npx eslint Footer.tsx` → 0 errores

## Commit

`fix(web): footer configurable desde CMS sin placeholders (Fase 4)`
