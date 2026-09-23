# Fix 29 — HandleInertiaRequests condicional por ruta (Fase 3)

## Problema

`analisis-website01.md` §4.2.2 / §5.2.5: `share()` ejecutaba `get_menu()`, `get_populares()` y `get_shop_cart()` en **cada request**, incluyendo `/admin/*` donde el carrito y los productos populares no se usan.

## Solución

En `HandleInertiaRequests::share()`:

- Detectar `$isPublic = ! $request->is('admin*', 'login', 'register', 'password*', 'up')`.
- **Público**: carga `menu`, `populares`, `cart`, `cates`, `marcas`, `currentpage`, `find` (igual que antes; `menu`/`populares` ya van con `Cache::remember` de F2-11).
- **Admin/auth**: devuelve arrays vacíos / `cart = null` **sin** ejecutar las queries de tienda.

El admin solo usa `DropdownMenu` de shadcn — no depende de `cart`/`populares`/`menu` de tienda.

## Archivos modificados

- `app/Http/Middleware/HandleInertiaRequests.php`

## Verificación

- `artisan test --compact` → **86/86** (DashboardTest + StorefrontTest + Cart* verifican ambos lados).
- `npx tsc --noEmit` → 0 errores.

## Fases

**Fase 3 (calidad / rendimiento)** — `analisis-website01.md` §4.2.2, §5.2.5.
