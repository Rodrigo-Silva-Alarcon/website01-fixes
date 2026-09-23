# Fix 23 — Paginación con filtros (Fase 2)

## Problema

`ProductosPage` paginaba con `router.get(link.url, { cs, ms, find })`, mezclando la URL del paginador Laravel (que tras un POST de filtros solo traía `?page=N`) con parámetros locales. Resultado: al pasar de página se perdían los filtros o se generaban URLs inconsistentes. `analisis-website01.md` §4.4.3 / §7 — “Fix paginación”.

## Solución

1. **Backend** (`WebTrail::get_products`): `$products->appends(request()->only(['cs', 'ms', 'find', 'category', 'subcategory', 'brand']))` — los `link.url` del paginador ya incluyen filtros y búsqueda.
2. **Frontend** (`ProductosPage` Pagination): navegar directamente a `link.url` sin re-mezclar params locales:
   `router.get(link.url, {}, { preserveScroll: true })`.
3. **Test**: `StorefrontTest` “provides GET pagination links after filtering” — `next_page_url` ahora es `route('products').'?cs%5B0%5D=1&page=2'` (filtros preservados); se actualizó la expectativa al comportamiento correcto.

## Archivos modificados

- `app/Traits/WebTrail.php`
- `resources/js/pages/web/ProductosPage.tsx`
- `tests/Feature/StorefrontTest.php`

## Verificación

- `npx tsc --noEmit` → 0 errores.
- `artisan test tests/Feature/StorefrontTest.php` → 14/14.

## Fases

**Fase 2 (UX / paginación)** — `analisis-website01.md` §4.4.3 y §7.
