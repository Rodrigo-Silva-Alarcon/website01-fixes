# Fase 4-16 — Navegación de categorías en el menú (§4.7.11)

## Problema

3 de 6 categorías del menú apuntaban a `/`. Causa: `<Link>` anidado dentro de `<button>` (HTML inválido; el navegador rompe la navegación) y `if (item.submenu)` siempre truthy porque `submenu` es array.

## Cambios

| Archivo | Cambio |
|---|---|
| `resources/js/pages/web/imports/CategoriasMenu.tsx` | Wrapper `<div>` con hover (no `<Link>` en `<button>`); `submenu.length > 0` para desplegar; `onEnter`/`onLeave` en el link |
| `tests/Feature/StorefrontTest.php` | Menú incluye solo categorías activas con slug; `GET /productos/{slug}` OK |

## Notas

- `WebContentService::menu()` ya exponía `'id' => $cate->slug` — el problema era 100% de estructura HTML en el componente.

## Verificación

- `artisan test --compact` → **102 passed (532 assertions)**
- `npx tsc --noEmit` → OK
- `npx eslint` → 0 errores

## Commit

`fix(web): links de categorías del menú sin botón anidado (Fase 4)`
