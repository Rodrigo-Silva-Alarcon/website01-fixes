# Fix — Security headers + Content-Security-Policy (Fase 4)

## Problema

`analisis-website01.md` §4.1.5: no hay CSP ni headers de seguridad estándar en respuestas HTML.

## Solución

1. **Nuevo `app/Http\Middleware/SecurityHeaders.php`** — aplica a respuestas no-asset:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy` (camera/mic/geolocation/payment off)
   - **CSP** solo en HTML exitoso (`text/html`): `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'self'`, `form-action 'self'`, script/style/font/img/connect restringidos a self + Google Fonts + `ws:`/`wss:` (Vite HMR).
2. **`bootstrap/app.php`** — registrado en el stack `web` tras `CacheHeaders`.
3. Assets (`build/`, `data/`, `storage/`, extensiones binarias) y errores no-HTML **no** llevan CSP.

## Archivos modificados

- `app/Http/Middleware/SecurityHeaders.php` (nuevo)
- `bootstrap/app.php`
- `tests/Feature/SecurityHeadersTest.php` (nuevo, 2 tests)

## Verificación

- `artisan test --compact` → **88/88** (393 assertions).
- `npx eslint` / `npx tsc --noEmit` → 0 errores.

## Fases

**Fase 4 (seguridad/UX)** — `analisis-website01.md` §4.1.5.
