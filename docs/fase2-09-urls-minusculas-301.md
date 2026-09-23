# Fix 25 — URLs públicas en minúsculas con redirects 301/302 (Fase 2)

## Problema

Rutas del storefront en español con mayúsculas iniciales (`/Nosotros`, `/Productos`, `/Servicios`, `/Contactanos`, `/Find`, `/Enviar`, `/AddShop/...`). `analisis-website01.md` §4.3.3 / §7 — “URLs sin tildes + redirects”.

## Solución

Normalizar **todas las rutas públicas a minúsculas** (ya estaban sin tildes) y redirigir las variantes legacy:

| Canonical (GET/POST) | Legacy → redirect |
|---|---|
| `/nosotros` | `/Nosotros` |
| `/productos`, `/productos/...` | `/Productos` |
| `/productos/filtrar` | `/Productos/Filtrar` (ruta renombrada) |
| `/marcas/{brand}` | `/Marcas/{brand}` |
| `/servicios` (→ contacto) | `/Servicios` → `/contactanos` |
| `/contactanos` | `/Contactanos`, `/Contacto`, `/contacto` |
| `/find` | `/Find` |
| `/enviar` (POST) | — |
| `/addshop/{product}`, `/shop/{product}`, `/removeshop/{product}` | variantes capitalizadas |

Los **nombres de ruta** (`products`, `about`, `contact`, `addshop`, …) no cambiaron → `route()` en PHP/JS/Ziggy se actualiza solo.

Tests actualizados a las URLs nuevas + cobertura de redirects legacy (`StorefrontTest`, `CartQuantityTest`).

## Archivos modificados

- `routes/web.php`
- `tests/Feature/StorefrontTest.php`
- `tests/Feature/CartQuantityTest.php`

## Verificación

- `artisan test --compact` → **78/78**.
- `npx tsc --noEmit` → 0 errores (sin cambios de UI).

## Fases

**Fase 2 (SEO / URLs)** — `analisis-website01.md` §4.3.3 y §7.
