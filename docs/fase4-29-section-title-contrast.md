# Fix — Contraste de títulos de sección en dark mode (Fase 4)

## Problema

Títulos de sección de la home (`Productos populares`, `Categorías`,
nombres de categoría en `BlockCategory`) usaban color fijo `text-[#191c1f]`
(casi negro). Con `.dark` activo (`--background: oklch(0.145 0 0)`), el texto
quedaba ilegible sobre el fondo negro.

Medido en navegador (dark): color `rgb(25, 28, 31)` sobre fondo casi negro.

**No** se toca texto dentro de tarjetas con fondo claro (`#f2f4f5`,
`#e0eef3`, blanco) — ahí `#191c1f` sigue siendo correcto en ambos temas.

## Solucion

Reemplazar `text-[#191c1f]` por `text-foreground` (token `--foreground` del
tema: claro `oklch(0.145)` / oscuro `oklch(0.985)`) en los títulos de
sección sobre el fondo de página:

| Archivo | Título |
|---|---|
| `components/Ofertas.tsx` | Productos populares |
| `components/Categorias.tsx` | Categorías |
| `imports/BlockCategory.tsx` | CategoryTitle (nombre de categoría) |

`Marcas.tsx` no se modifica: su sección tiene `bg-[#f2f4f5]` (siempre claro).

## Archivos modificados

- `resources/js/pages/web/components/Ofertas.tsx`
- `resources/js/pages/web/components/Categorias.tsx`
- `resources/js/pages/web/imports/BlockCategory.tsx`

## Verificacion

- Navegador dark: títulos de sección con `color oklch(0.985 0 0)` (blanco);
  texto en cards claras sigue `rgb(25, 28, 31)`.
- `npx tsc --noEmit` → OK
- `npx eslint` (3 archivos) `--max-warnings 0` → OK
- `artisan test --compact` → **111/111** (623 assertions)

## Commit

`fix(ui): contraste de titulos de seccion en dark mode (Fase 4)`
