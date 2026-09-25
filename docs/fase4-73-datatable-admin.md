# F4-73 — DataTable/CRUD genérico para los 6 Index de admin (§7.1 primera parte)

## Problema

Los `Index.tsx` de `products`, `categories`, `subcategories`, `brands`, `banners` e
`inventories` eran copias entre sí con **55-88 % de duplicación** (330-515 líneas
c/u; ~2460 líneas totales, ~1900 redundantes). Al ser copias-pegado acumularon bugs
derivados de la plantilla original (`texts`):

- **brands y banners enviaban `{products: ...}`** en el reorder → `BrandController`/
  `BannerController` esperan `brands`/`banners` → **422 de validación** al arrastrar.
- `brands/Index.tsx` usaba tipo y estado `Banner` y toasts "Banner no publicada".
- Diálogo de borrado de productos decía *"Se eliminará … el texto"*; toast "Categoria
  eliminada" en productos.
- Efectos `console.*` muertos, "Cateogoría", "baners".

## Cambios

| Archivo | Cambio |
|---|---|
| `components/admin/entity-index.tsx` | **Nuevo componente genérico** `EntityIndex<T>`: tabla con ordenación, búsqueda (debounce), switches de publicación (dnd-kit opcional vía `reorderKey` — payload con la key correcta de la entidad —, `toggle`), slot `toolbar`, paginación (solo si `last_page > 1`), AlertDialog de borrado con nombre real (`deleteName`), toasts de éxito/error, sincronización de estado con `records.data` |
| `admin/{products,categories,subcategories,brands,banners,inventories}/Index.tsx` | Reescritos como wrappers (~50-130 líneas c/u): columnas propias, mensajes y `deleteName` por entidad; `products` incluye subcomponente `ProductsToolbar` (selects categoría/subcategoría) |

Todas las rutas/permisos/labels originales se conservan (`route('x.index')`,
`permission:view_x`, headers de columna, etc.). Queda fuera de esta fase la segunda
mitad de §7.1 (base de `_form.tsx` compartida, ~1300 líneas en `products/_form`) —
fix aparte.

## Verificación

- `npm run build` OK; `npm run lint` → **0 errors / 272 warnings** (antes 330);
  `php artisan test --compact` → **130 passed (699 assertions)**.
- QA browser (login admin `mjuchani`, one-shot): las **6 páginas** con h1 correcto,
  cabeceras propias, filas 18/4/16/10/3/18, botón Crear, **0 console errors**.
- Click real: búsqueda `search=Samsung` → URL con parámetros → **3 filas** filtradas.
- Click real: switch de marcas → `PATCH toggle-publish` **303** en ambas direcciones.
- Click real: papelera → diálogo *"…permanentemente \"Refrigeradora Samsung 400L\""*
  → Cancelar → 18 filas intactas. Enlace Editar → `/admin/products/1/edit`.
- Bugs de plantilla corregidos de paso (reorder brands/banners, tipos, textos).

## Hallazgo de entorno (no es bug de la app)

El modo `--session` de la herramienta de QA (chrome desprendido + `connectOverCDP`)
**deja de entregar input de hardware (ratón/teclado/CDP crudo) tras el login**, en
cualquier página: hit-testing, rAF y eventos sintéticos siguen normales — es una
limitación del harness, no del código. La QA interactiva definitiva se ejecutó en
modo one-shot (`chromium.launch`), donde el input funciona correctamente.
