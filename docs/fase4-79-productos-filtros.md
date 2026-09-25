# F4-79 — Página de productos: filtros se desmarcaban, toggle no funcionaba y "Cargar más" solo se escondía

## Problema

Tres bugs reportados en `/productos`:

1. **Al seleccionar una categoría o marca se desmarcaba lo ya seleccionado.**
2. **El botón "Mostrar filtros" no funcionaba.**
3. **"Cargar más" se escondía al presionarlo** en vez de mostrar un
   "Mostrar menos".

## Causas raíz

### 1. Checkboxes que navegaban (bug principal)

Los botones de categorías/marcas (y también el toggle y "Cargar más") estaban
dentro del `<form>` **sin `type`**, y en HTML un `<button>` sin atributo es
`type="submit"`. Cada click en un checkbox **enviaba el formulario** →
`router.get` → Inertia remontaba el componente (`preserveState` por defecto
`false`) → el estado se reiniciaba desde las props `cates`/`marcas`, que la
URL manda **como strings** (`?cs[0]=1` → `"1"`), mientras que
`selectedCategories.includes(categoria.id)` compara con **números** →
`includes(1)` sobre `["1"]` es `false` → **checkbox sin marcar**. Además el
toggle llamaba a `setData` dentro del updater de otro `setState` (doble fuente
de verdad `selected*` vs `data.*`).

### 2. Toggle "Mostrar filtros" inoperante

- El contenedor del sidebar usaba `${showFilters ? "block" : "hidden"} lg:block`
  → **`lg:block` forzaba la visibilidad en escritorio** sin importar el estado.
- El botón interno era `type=submit` → su click disparaba una navegación que
  remontaba el componente y reseteaba `showFilters` a su valor inicial → en
  escritorio no se veía ningún efecto.
- El estado inicial era `false` aunque en escritorio el sidebar arranca
  visible.

### 3. "Cargar más" no cargaba nada

El componente calculaba `displayedBrands = showAll ? brands : brands.slice(0,5)`
pero el JSX mapeaba **`brands` completo**: la lista ya mostraba las 10 marcas,
el botón solo desaparecía (`{!showAll && ...}`) sin mostrar "Mostrar menos".
Con 10 marcas activas en BD el efecto visible era exactamente el reportado.

## Cambios

| Archivo | Cambio |
|---|---|
| `resources/js/pages/web/ProductosPage.tsx` | Todos los botones no-submit del form con `type="button"` (checkboxes, toggle, cargar más) → los clicks solo actualizan estado, sin navegación; `useForm` pasa a ser la única fuente de verdad (`data.cs`/`data.ms`, eliminados `selectedCategories`/`selectedBrands` y el `setData` dentro de updaters); ids de `cates`/`marcas` normalizados con `Number()` (URL envía strings); `Filtrar` con `preserveState: true` (la selección y el toggle sobreviven la visita; las props `products` actualizan igual); contenedor del sidebar sin conflicto de display (`flex`/`hidden lg:block`) y ancho condicional (`lg:w-auto` colapsado); pill "Mostrar/Ocultar filtros" `hidden lg:flex` (escritorio) fuera del bloque colapsable → **queda visible al colapsar para poder reabrir**; `showFilters` inicial según viewport (`>=1024px` → visible); wrapper colapsable dentro del form; marcas mapean `displayedBrands` y el botón alterna `Cargar más` ↔ `Mostrar menos` con chevron rotado, solo si hay más de 5 |

Comportamiento nuevo esperado: marcar es acumulativo (sin navegación), "Filtrar"
aplica la query y conserva la UI, en escritorio el sidebar arranca visible y se
puede ocultar/reabrir con el pill, en móvil el botón externo "Mostrar filtros"
muestra el panel, y "Cargar más" revela las 5 marcas restantes (5 → 10) con
"Mostrar menos" para volver.

## Verificación

- `npm run lint` → **0 errors / 216 warnings**; `npm run build` OK.
- `php artisan test --compact` → **137 passed (731 assertions)**.
- **QA browser (one-shot)** en `/productos` (desktop 1440×900 + móvil 375×700):

  | Paso | Resultado |
  |---|---|
  | inicial escritorio | sidebar `flex`, wrapper `block`, pill "Ocultar filtros", 12 botones |
  | click "Electrodomésticos" | marcado ✓, **URL sigue `/productos` (sin navegación)** ✓ |
  | click "Cocina" | ambas marcadas ✓ (acumulativo) |
  | click "Samsung" | marca + 2 categorías siguen marcadas ✓ |
  | "Cargar más" | 12 → **17 botones** (5 → 10 marcas), label "Mostrar menos" ✓ |
  | "Mostrar menos" | vuelve a 12, label "Cargar más" ✓ |
  | "Ocultar filtros" | wrapper `none`, **pill sigue visible** ("Mostrar filtros"), selección intacta ✓ |
  | "Mostrar filtros" | wrapper `block` ✓ |
  | "Filtrar" | URL `/productos?cs%5B0%5D=1&cs%5B1%5D=2&ms%5B0%5D=1`, **las 3 siguen marcadas** ✓ |
  | móvil recargado | sidebar oculto, barra externa visible; click → sidebar `flex` ✓, pill propio `none` ✓ |
  | consola | **0 console errors / 0 requests fallidos** |

- Backend sin cambios: `WebController::products()` ya leía `$request->cs`/`ms`
  y `HandleInertiaRequests` comparte `cates`/`marcas` desde la query.
