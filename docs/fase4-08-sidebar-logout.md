# Fase 4-08 — Botón de cerrar sesión visible en el sidebar admin (§4.8.7)

## Problema

El logout solo existía dentro del dropdown del usuario (`UserMenuContent`); no había
un control visible en el sidebar/header. El usuario debía saber la ruta `POST /logout`.

## Cambios

| Archivo | Cambio |
|---|---|
| `resources/js/components/nav-user.tsx` | Añade `SidebarMenuButton` con icono `LogOut` + label **"Cerrar sesión"** debajo del bloque de usuario; reutiliza el mismo `handleLogout` (`cleanup` + `router.flushAll`) y `logout()` de `@/routes`; `tooltip="Cerrar sesión"` al colapsar el sidebar |

## Comportamiento

- Sidebar admin expone siempre "Cerrar sesión" (visible, no enterrado en menú).
- Al colapsar el sidebar muestra tooltip con la misma acción.
- El item en el dropdown del usuario se mantiene (acceso desde el menú).

## Verificación

- `npx eslint resources/js/components/nav-user.tsx` → 0 errores
- `npx tsc --noEmit` → OK

## Commit

`feat(admin): botón de cerrar sesión visible en el sidebar (Fase 4)`
