# Fix 27 — Cache headers + Cache::remember en queries compartidas (Fase 2)

## Problema

- **Zero caching** (`analisis-website01.md` §5.2.2): ninguna instancia de `Cache::` en el codebase; `get_menu()`, `get_populares()`, `get_marcas()`, `get_banners()` se ejecutan en **cada request** vía `HandleInertiaRequests::share()`.
- **Sin Cache-Control** en respuestas (§4.2.6): el plan Fase 2 incluye “Cache headers + sprites”.

## Solución

### 1. Middleware `CacheHeaders`

Registrado al final del stack `web` en `bootstrap/app.php`:

| Tipo de request | `Cache-Control` |
|---|---|
| Assets estáticos (`data/`, `build/`, `storage/`, `views/`, `*.js|css|png|…`) | `public, max-age=604800, stale-while-revalidate=86400` |
| `/sitemap.xml` | `public, max-age=3600` |
| GET público (HTML Inertia) | `private, max-age=0, must-revalidate` |
| `admin*`, `login`, `register`, `up` | sin cambio |

Nota: con `php artisan serve`, los archivos estáticos de `public/` a menudo se sirven fuera del middleware; en nginx/Apache sí aplica. El header de HTML sí se verifica localmente.

### 2. `Cache::remember(..., 60, ...)` en `WebTrail`

- `get_menu()` → clave `web_menu`
- `get_populares()` → `web_populares`
- `get_detacados()` → `web_detacados`
- `get_marcas()` → `web_marcas`
- `get_banners($page)` → `web_banners_{page}`

TTL 60 s: refleja cambios del admin en ≤1 min sin invalidación manual. Reduce queries por request en el middleware de Inertia.

### Sprites

Los iconos de UI ya son **SVG inline / mask-image** (componentes React), no requests de PNG sueltos → un sprite sheet no aporta; queda documentado como no aplica en este codebase.

## Archivos modificados

- `app/Http/Middleware/CacheHeaders.php` (nuevo)
- `bootstrap/app.php`
- `app/Traits/WebTrail.php`

## Verificación

- `GET /` → `Cache-Control: max-age=0, must-revalidate, private` (200)
- `GET /sitemap.xml` → `Cache-Control: max-age=3600, public` (200)
- `artisan test --compact` → **78/78**
- `npx tsc --noEmit` → 0 errores

## Fases

**Fase 2 (rendimiento visual)** — `analisis-website01.md` §4.2.6 (paso 3), §5.2.2.
