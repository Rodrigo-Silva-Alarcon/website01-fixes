# F4-74 — Primitivas compartidas para los `_form` de admin (§7.1 segunda parte)

## Problema

Los10 `_form.tsx` del admin duplicaban los mismos bloques entre sí:

- Efectos de toasts de éxito/error y de validación (~16 líneas × cada formulario).
- Shell completo: `AppLayout + Head + Card con botón de regreso + <form> + botón de
  envío` (~40 líneas × cada uno).
- Campo con Label + control + `<p>` de error (~8 líneas × ~60 campos).
- Checkbox "Publicar" con su error.
- Campo de imagen con preview, validación tipo/peso, marcado de eliminación e
  init desde la imagen existente (~80 líneas copiados en marcas, categorías y
  banners).
- Botones de envío "{isEdit ? Actualizar : Crear} X".

Además arrastraban errores de copia-pegado: `function TextForm` en categorías/
subcategorías/productos, `function BannerForm` en marcas, toasts *"Texto
actualizado/creado"* en categorías, subcategorías y productos (y *"banner"* en
marcas), y `console.log` de debug en los `onError`.

## Cambios

| Archivo | Cambio |
|---|---|
| `components/admin/form-shell.tsx` | **Nuevo**: `useFormAlerts()`, `FormShell` (shell con `after` opcional para modales), `Field`, `CheckboxField`, `ImageUploadField` |
| `admin/{brands,categories,subcategories,banners,inventories}/_form.tsx` | Reescritos sobre las primitivas (268→120, 304→167, 232→158, 473→279, 251→160 líneas aprox.); nombres de función y toasts corregidos a su entidad; código muerto eliminado (`removeImage`/`restoreImage` sin uso, `console.log`) |
| `admin/products/_form.tsx` | Aplicadas `FormShell` + `useFormAlerts` + toasts/nombre corregidos (`ProductForm`); sus campos complejos (galería, video, editor, especificaciones) y el `ModalForm` de inventario se mantienen sin tocar por ser únicos |

Los `forceFormData: true` se conservaron donde ya estaban (codificación de
`_method`/archivos sin cambios de comportamiento).

## Verificación (QA browser, modo one-shot, login admin)

- **6 páginas `/create`**: título, botón de envío correcto (`Crear Producto`,
  `Crear Categoría`, `Crear Subcategoría`, `Crear Marca`, `Crear Banner`,
  `Crear Inventario`), campos presentes, botón de regreso navega a su índice,
  **0 console errors**.
- `/admin/products/1/edit`: precarga `Refrigeradora Samsung 400L` + `Actualizar Producto`.
- **Submit real con validación** (categoría vacía): se queda en `/create`, error
  del servidor *"El nombre de la categoría es obligatorio."* + toast *"Por favor
  corrige los errores en el formulario"* — `Field` + `useFormAlerts` funcionan de
  punta a punta.
- `npm run build` OK; `npm run lint` → **0 errors / 217 warnings** (antes 272);
  `php artisan test --compact` → **130 passed**.
