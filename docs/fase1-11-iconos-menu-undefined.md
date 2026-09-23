# Fix 11 — Iconos "undefined" en el menú de categorías (Fase 1)

## Problema

`CategoriasMenu.tsx` renderizaba el icono con:

```tsx
dangerouslySetInnerHTML={{ __html: String(icono) }}
```

Cuando `item.icon` no existía o no coincidía con `TYPE_SVG_ICONS`, `icono` era `undefined` y **`String(undefined)` imprimía el texto literal `undefined`** delante del nombre de cada categoría en la barra del header (p. ej. `undefined Electrodomésticos`).

## Solución

Renderizar el bloque del icono solo si `icono` está definido (`{icono ? ... : null}`) en `MenuItemComponent` y en `Submenu`. El nombre de la categoría se muestra siempre; sin icono válido no se inyecta HTML roto.

## Archivos modificados

- `resources/js/pages/web/imports/CategoriasMenu.tsx`

Además, en el mismo archivo se corrigió el `href` del item principal: con submenu apuntaba a `#` (quedaba en la página actual / homepage en la práctica). Ahora siempre usa `route('category', { category: item.id })` (§4.7.11).

## Verificación

- Grep: sin `String(icono)` en `resources/js`.
- Home en el navegador: barra de categorías muestra solo nombres (sin prefijo `undefined`).
- `/Nosotros`: botones "Electrodomésticos" / "Muebles" enlazan a su categoría (no a `#`).

## Fases

**Fase 1 (crítico / navegación)** — `analisis-website01.md` §4.7.7 / §4.7.11 (header de categorías roto).
