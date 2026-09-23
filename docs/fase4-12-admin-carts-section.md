# Fase 4-12 — Sidebar "Carrito de Compras" → sección de carritos (§4.7.17)

## Problema

El link del sidebar apuntaba a `products.index`. No existía ruta ni página
Inertia de carritos (el `CartController` apuntaba a Blade `admin.carts.*`
inexistente).

## Cambios

| Archivo | Cambio |
|---|---|
| `app/Http/Controllers/Admin/CartController.php` | Reescrito a Inertia: `index` (búsqueda + paginación) y `destroy` |
| `resources/js/pages/admin/carts/Index.tsx` | Nueva página: tabla de carritos (usuario, sesión, ítems), búsqueda, paginación, eliminar |
| `routes/web.php` | `admin.carts.index` (GET) + `admin.carts.destroy` (DELETE) |
| `resources/js/components/app-sidebar.tsx` | Link → `route('admin.carts.index')` |
| `app/Http/Middleware/ExcludeAdminZiggyRoutes.php` | Excluir `admin.carts.*` del Ziggy público |
| `tests/Feature/AdminCartsTest.php` | 4 tests: listado, vacío, delete, auth |

## Verificación

- `artisan test --compact` → **98 passed (460 assertions)**
- `npx tsc --noEmit` → OK
- `npx eslint` en archivos tocados → 0 errores
- `npm run build` → OK

## Commit

`feat(admin): sección de carritos y link correcto en sidebar (Fase 4)`
