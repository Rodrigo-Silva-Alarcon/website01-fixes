# Fix — Botón "Añadir al carrito" siempre visible (Fase 4)

## Problema

En las cards de producto del home, el botón "Añadir al carrito" solo
aparecía al hacer hover sobre la card:

```
opacity-0 group-hover:opacity-100 transition-opacity duration-300
hidden group-hover:flex
```

En táctil no hay hover → el botón era inalcanzable en móvil/tablet.

## Solucion

Reemplazar la cadena hover-hide por `flex` fijo en los dos componentes
activos del home:

| Archivo | Línea |
|---|---|
| `imports/BlockCategory.tsx` | 185 |
| `components/Ofertas.tsx` | 172 |

Los imports `Ofertas-9-*` con el mismo patrón no están en el árbol de
render (huérfanos de Framer) → no se tocaron.

## Archivos modificados

- `resources/js/pages/web/imports/BlockCategory.tsx`
- `resources/js/pages/web/components/Ofertas.tsx`

## Verificacion

- `npx tsc --noEmit` → OK
- `npx eslint BlockCategory.tsx Ofertas.tsx --max-warnings 0` → OK

## Commit

`fix(ui): boton anadir al carrito siempre visible (Fase 4)`
