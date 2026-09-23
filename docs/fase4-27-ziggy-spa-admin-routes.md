# Fix — Ziggy sin rutas admin tras login SPA (Fase 4)

## Problema

Dashboard admin en blanco tras login con:

```
Ziggy error: route 'products.index' is not in the route list
```

**Causa raíz:** el login por Inertia no recarga el HTML. El payload Ziggy del
request inicial (`/login`, anónimo → filtrado por `ExcludeAdminZiggyRoutes`)
persiste durante toda la sesión SPA. Al navegar a `/admin/dashboard` (Client
Side), `route('products.index')` no existe → crash de React.

Además, `BladeRouteGenerator::$generated` es estático: entre requests en el
mismo proceso (tests / Octane) la segunda respuesta emitía MergeScript
(`Object.assign(Ziggy.routes,...)`) sin definir `const Ziggy=`.

## Solucion

1. **`ExcludeAdminZiggyRoutes.php`**
   - `$needsAdminRoutes = auth()->check() || ...` — autenticados siempre
     reciben rutas admin (navegación SPA desde `/login`).
   - `BladeRouteGenerator::$generated = false` — cada request emite Script
     completo (`const Ziggy=...`).
2. **`ZiggyAdminRoutesTest.php`**
   - Anónimos en `/`: sin `products.index` / `admin.dashboard`.
   - Autenticado en `/admin/dashboard`: sí expone rutas admin.
   - Autenticado en `/` (SPA post-login): sí expone `products.index`.

## Archivos modificados

- `app/Http/Middleware/ExcludeAdminZiggyRoutes.php`
- `tests/Feature/ZiggyAdminRoutesTest.php`

## Verificacion

- `artisan test --compact` → **111/111** (623 assertions).
- Navegador: login → `/admin/dashboard` carga sin error Ziggy.

## Fases

**Fase 4 (seguridad/UX)** — follow-up de §4.1.4 (F4-07).
