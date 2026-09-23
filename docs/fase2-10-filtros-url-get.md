# Fix 26 — Filtros de productos en URL con query params GET (Fase 2)

## Problema

Filtros de categoría/marca y búsqueda se enviaban por **POST** a `/productos/filtrar`. No se reflejaban en la URL → imposible compartir/bookmarcar resultados. `analisis-website01.md` §4.4.2.

## Solución

Migrar **Sidebar** y **búsqueda (Header desktop + mobile)** de `post(products_post)` a `router.get(route('products'), params)` con query params:

- `?cs[]=1&ms[]=2` — categorías y marcas
- `&find=texto` — término de búsqueda
- `&page=1` — reset de paginación al filtrar/buscar

El backend ya leía `$request->cs` / `$request->ms` / `$request->find` en `HandleInertiaRequests::share()` — solo faltaba el frontend. La ruta POST `/productos/filtrar` se mantiene por compatibilidad.

También se corrigió la ruta del form de contacto en `ContactoPage.tsx`: `/Enviar` → `/enviar`.

## Archivos modificados

- `resources/js/pages/web/ProductosPage.tsx` — Sidebar `router.get`
- `resources/js/pages/web/components/Header.tsx` — búsqueda desktop + mobile `router.get`
- `resources/js/pages/web/ContactoPage.tsx` — POST a `/enviar`

## Verificación

- `npx tsc --noEmit` → 0 errores.
- `npx eslint` sobre los 3 archivos → 0 errores (solo warnings pre-existentes).
- `artisan test --compact` → **78/78**.

## Fases

**Fase 2 (SEO / URLs / UX)** — `analisis-website01.md` §4.4.2.
