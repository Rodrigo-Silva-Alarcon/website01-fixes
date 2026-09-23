# Fase 4-20 — Eliminar import duplicado de `globals.css` (§4.2.5)

## Problema

`HomePage.tsx` y `AboutPage.tsx` importaban `@/pages/web/styles/globals.css` además de `Layout.tsx`, que ya lo importa → CSS duplicado en el bundle.

## Cambios

| Archivo | Cambio |
|---|---|
| `resources/js/pages/web/HomePage.tsx` | Eliminado `import "@/pages/web/styles/globals.css"` |
| `resources/js/pages/web/AboutPage.tsx` | Eliminado `import "@/pages/web/styles/globals.css"` |

`Layout.tsx` (línea 3) sigue siendo el único importador de `globals.css` para las páginas web.

## Verificación

- `artisan test --compact` → **105 passed (577 assertions)**
- `npx tsc --noEmit` → OK
- `npx eslint HomePage.tsx AboutPage.tsx` → 0 errores (warnings preexistentes de imports sin uso)

## Commit

`fix(web): eliminar import duplicado de globals.css (Fase 4)`
