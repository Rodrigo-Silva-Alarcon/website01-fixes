# Fase 4-23 — Permisos RBAC granulares (§4.8.8)

## Problema

`analisis-website01.md` §4.8.8: el sistema RBAC solo tenía permisos CRUD para
`users`, `roles`, `permissions` y `texts`. No había permisos granulares para
productos, categorías, subcategorías, marcas, banners, inventarios ni carritos:
cualquier usuario autenticado con `access_dashboard` podía editar catálogo
(§5.1.1 middleware de permisos ausente).

## Cambios

| Archivo | Cambio |
|---|---|
| `config/variables.php` | Sectores: `products`, `categories`, `subcategories`, `brands`, `banners`, `inventories`, `carts` |
| `config/sectores.php` | Mismos sectores con `permiso_vista` + rutas |
| `database/seeders/PermissionSeeder.php` | CRUD (view/create/edit/delete/show) vía `PermissionHelper` para los 7 sectores |
| `database/seeders/SectorPermissionsSeeder.php` | Mismos sectores + conserva sectores legacy (`productos`, `ventas`, …) |
| `routes/web.php` | Middleware `permission:view_*` en groups de categories, subcategories, products, banners, brands, inventories, carts |
| `resources/js/components/app-sidebar.tsx` | Links del catálogo filtran por `view_*` en lugar de `access_dashboard` |
| `tests/Pest.php` | Helper global `seedRbac()` (RoleSeeder + PermissionSeeder + RolePermissionSeeder) |
| `tests/Feature/AdminCartsTest.php` | `seedRbac()` en tests admin + test 403 sin `view_carts` |
| `tests/Feature/RolePermissionTest.php` | Tests: existencia de 35 permisos CRUD + admin tiene todos |

## Comportamiento

- Admin (`RolePermissionSeeder`): recibe **todos** los permisos (sync).
- `editor_textos` / `viewer_textos`: solo textos + generales (sin catálogo).
- Rutas admin de catálogo exigen `view_*`; sidebar oculta secciones sin ese permiso.

## Verificación

- `artisan test --compact` → **108 passed (617 assertions)**
- `npx tsc --noEmit` → OK

## Commit

`feat(rbac): permisos granulares de catálogo (Fase 4)`
