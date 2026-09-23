# Fase 4 · Fix F4-34 — Middleware de permisos en rutas admin restantes (§5.1.1)

## Problema

`analisis-website01.md` §5.1.1: F4-23 añadió `permission:view_*` al catálogo
(categories, subcategories, products, banners, brands, inventories, carts), pero
otras rutas del panel seguían solo con `auth` + `verified`:

- `dashboard` — sin `access_dashboard`
- `users` — cualquier verificado podía listar/crear/editar usuarios
- `texts` — sin `view_texts`
- `images` — sin `view_products`

## Cambios

### `routes/web.php`

| Ruta | Middleware |
|---|---|
| `admin.dashboard` | `permission:access_dashboard` |
| `admin.users.*` (resource + show + password) | `permission:view_users` |
| `admin.texts.*` (resource + toggle-publish) | `permission:view_texts` |
| `images.*` (reorder, store, resource) | `permission:view_products` |

Roles existentes (F4-23 / `RolePermissionSeeder`):

- **admin**: todos los permisos → OK
- **editor_textos / viewer_textos**: `access_dashboard` + `view_texts` → dashboard y textos OK; usuarios e imágenes → 403
- **sin rol / sin permiso**: 403

## Tests

- Nuevo `tests/Feature/AdminRbacRoutesTest.php` (6 casos: guest redirect,
  admin 200, sin permiso 403, viewer sin users/images 403, viewer con texts 200)
- `DashboardTest`, `DashboardMetricsTest`, `ZiggyAdminRoutesTest`,
  `StorefrontTest` (texts Edit): añaden `seedRbac()` + rol
- `RolePermissionTest`: permiso de prueba renombrado a `view_users`

## Verificación

- `php artisan test --compact` → **118 passed (631 assertions)**
- ESLint/TSC no afectados (solo PHP + tests)
