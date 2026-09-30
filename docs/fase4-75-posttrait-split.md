# F4-75 — Split de `PostTrait` en traits especializados (§7.2)

## Problema

`app/Traits/PostTrait.php` era un "god trait" de **618 líneas** usado por **14
controladores** (Post, Banner, Brand, Category, Dashboard, Inventory, Permission,
Product, Role, Subcategory, Text, User…): en un solo archivo convivían
procesamiento de imágenes (resize + thumbnail + WebP), subida de archivos,
búsqueda/ordenamiento, paginación, relaciones, hashes, checkboxes/radios, el CRUD
completo (`createRecord`/`updateRecord`/`destroyRecord`) y la generación de reglas
de validación. Cualquier cambio en un área obligaba a revisar el archivo entero.

## Cambios

División en **4 traits especializados que `PostTrait` compone vía `use`** — los 14
controladores **no cambian** (el aplanado de traits de PHP mantiene el mismo
comportamiento y visibilidad):

| Archivo | Contenido | Líneas |
|---|---|---|
| `Traits/ImageHandling.php` | **Nuevo**: props `$image*` + `configureImages()` + `processImage()` (resize, WebP, thumbnail) | ~110 |
| `Traits/FileUpload.php` | **Nuevo**: props `$file*` + `configureFiles()` + `processFile()` | ~53 |
| `Traits/Searchable.php` | **Nuevo**: props `$searchableFields`/`$sortableFields` + `configureSearchable()`/`configureSortable()` | ~30 |
| `Traits/Paginatable.php` | **Nuevo**: prop `$perPage` + `configurePagination()` | ~17 |
| `Traits/PostTrait.php` | Compone los 4 anteriores y conserva el CRUD (`indexWithFilters`, `createRecord`, `updateRecord`, `destroyRecord`), ciclo de vida de archivos (`getOldFiles`/`deleteOldFile(s)`), hashes, relaciones, appends, checkboxes/radios, exclusión de campos y `generateValidationRules()`. Imports podados (`Storage`, `Str`, `ImageManager`, `Driver`) | **618 → 370** |

Sin cambios de comportamiento: `processImage`/`processFile` siguen siendo `private`
y se invocan desde `createRecord`/`updateRecord` (tras el aplanado viven en la
misma clase). Se corrigió de paso el deprecation PHP 8.4 heredado
(`int $height = null` → `?int $height = null` en `configureImages`).

## Verificación

- `php -l` en los 5 archivos: sin errores de sintaxis.
- `php artisan test --compact` → **130 passed (699 assertions)**.
- **Smoke one-shot (login admin)**: 10 rutas admin con `h1` correcto
  (`/admin/products`, `categories`, `subcategories`, `brands`, `banners`,
  `inventories`, `users`, `roles`, `permissions`, `texts`) y **0 console/page
  errors**. Los 404 de `/admin` y `/admin/posts` son rutas inexistentes
  preexistentes (no son consumidores activos de la trait).
- **Flujo de escritura end-to-end con imagen** (ejercita `createRecord` +
  `ImageHandling::processImage` + `destroyRecord`): crear banner
  *"QA F4-75 split"* con PNG real → fila aparece en el índice, 0 errores →
  diálogo "Se eliminará permanentemente…" → *Eliminar* → fila fuera (3 restantes).
  Base de `public/data/banners` restaurada a 118 archivos al cerrar el QA.

### Hallazgo (preexistente, no introducido por este split)

El ciclo de escritura dejó **2 archivos huérfanos por borrado**: en
`destroyRecord`, `getOldFiles()` devuelve `$model->image` = solo el *filename*
(`68b53d4e….png`), no `data/banners/68b53d4e….png` → `File::exists(public_path(...))`
es `false` y **la limpieza nunca borra nada**. Verificado con log temporal
(`files:{"image":"…png"}`, `exists:false`) y con `deleteOldFile()` invocado
directamente (sí borra si recibe la ruta completa). El código es idéntico al
pre-split (movido textualmente), por lo que es un bug de comportamiento
**preexistente** de la app — candidato a fix aparte: completar el path con
`imagePath`/`filePath` en `getOldFiles()` (afecta a todos los modelos).
