# Fix — Overflow de tarjetas Destacados/Banner (Fase 4)

## Problema

En el carrousel **Destacados** (sección Banner de la home) el contenido se
desbordaba de la tarjeta:

- Texto largo (`w-[min-content]` + `min-w-full`) e imagen de tamaño fijo
  superaban el ancho de la card (`scrollWidth` > `clientWidth`).
- Falta de `min-w-0` en el flujo flex: los hijos `shrink-0` no podían
  comprimirse dentro de `basis-0 grow`.
- El `Banner` claro no tenía `overflow-clip` (sí el oscuro), por lo que el
  desborde era visible fuera del `rounded-[20px]`.

Medido en home (viewport 1920): cards con `scrollW 402/367 > clientW 316`.

## Solucion

1. **`Banner.tsx`**
   - `overflow-hidden` en la raíz de ambos banners + `overflow-clip` en el
     contenedor interno (paridad claro/oscuro).
   - `min-w-0` en Content/CONTENT/Heading y `break-words w-full` en el
     título del producto (elimina `w-[min-content]`).
   - Imagen responsive: `160→200→240` (claro) y `140/160 → 180/200 → 215/240`
     (oscuro) para caber en cards estrechas del grid.
   - Eliminado import `imgImage` no usado (ESLint).

## Archivos modificados

- `resources/js/pages/web/components/Banner.tsx`

## Verificacion

- `npx tsc --noEmit` → OK
- `npx eslint Banner.tsx --max-warnings 0` → 0 errores
- `artisan test --compact` → **111/111**
- `npm run build` → OK
- Navegador: Destacados sin `scrollWidth > clientWidth` en cards Banner.

## Commit

`fix(ui): sin desborde en tarjetas destacados (Fase 4)`
