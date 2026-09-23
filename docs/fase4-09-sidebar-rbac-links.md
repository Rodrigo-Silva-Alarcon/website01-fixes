# Fase 4-09 — Roles, Permisos y Textos visibles en el sidebar (§4.8.4)

## Problema

Las secciones `/admin/roles`, `/admin/permissions` y `/admin/texts` existían pero
estaban **comentadas** en el sidebar: solo se accedían escribiendo la URL a mano.

## Cambios

| Archivo | Cambio |
|---|---|
| `resources/js/components/app-sidebar.tsx` | Descomenta y reactiva los 3 items (Roles, Permisos, Textos) con sus iconos y filtros de permiso `view_roles` / `view_permissions` / `view_texts`. Elimina el item muerto de "Productos" duplicado (`/admin/productos`) |

## Comportamiento

- El sidebar muestra Roles/Permisos/Textos **solo** si el usuario tiene el permiso
  correspondiente (mismo filtro `hasPermission` que el resto).
- Sin permiso → el item no aparece (igual que Usuarios con `view_users`).

## Verificación

- `npx eslint resources/js/components/app-sidebar.tsx` → 0 errores
- `npx tsc --noEmit` → OK
- Permisos existen en `config/sectores.php` y `RolePermissionSeeder`

## Commit

`feat(admin): mostrar Roles, Permisos y Textos en el sidebar (Fase 4)`
