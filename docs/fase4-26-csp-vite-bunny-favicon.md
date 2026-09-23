# Fix — CSP rompia Vite HMR + Bunny Fonts y favicon 404 (Fase 4)

## Problema

Al levantar el proyecto en local la home se renderizaba **en blanco**. Consola:

1. **CSP bloqueaba Vite HMR** — `script-src` solo tenia `'self'`, pero en dev los scripts vienen de `http://127.0.0.1:5173` (otro origen). Bloqueados: `@vite/client`, `app.tsx`, `HomePage.tsx`, `@react-refresh`.
2. **CSP bloqueaba Bunny Fonts** — `style-src`/`font-src` solo permitian `fonts.googleapis.com`, pero `app.blade.php` carga `https://fonts.bunny.net/css?...`.
3. **`favicon.ico` 404** — el blade referenciaba `favicon.ico`/`favicon.png` que no existian en `public/`.

## Solucion

1. **`SecurityHeaders.php`**
   - `style-src` y `font-src` incluyen `https://fonts.bunny.net`.
   - Si existe `public/hot` (Vite en local), se anade el origen del HMR a `script-src`, `style-src`, `connect-src` y `font-src`. En prod no hay `hot`, asi que la CSP sigue estricta.
2. **`app.blade.php`** — icono apunta a `favicon.svg` (nuevo) + `apple-touch-icon.png` existente.
3. **`public/favicon.svg`** — favicon SVG simple de marca (casa verde).
4. **Test** — nuevo caso que crea `public/hot` temporal y verifica que la CSP incluye el origen HMR.

## Archivos modificados

- `app/Http/Middleware/SecurityHeaders.php`
- `resources/views/app.blade.php`
- `public/favicon.svg` (nuevo)
- `tests/Feature/SecurityHeadersTest.php`

## Verificacion

- `artisan test --compact` → **110/110** (621 assertions).
- Navegador: home carga, consola sin errores CSP, red 200 en Vite + fonts + favicon.

## Fases

**Fase 4 (seguridad/UX)** — follow-up de §4.1.5 (F4-03).
