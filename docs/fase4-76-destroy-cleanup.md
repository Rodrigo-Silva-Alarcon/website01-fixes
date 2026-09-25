# F4-76 — La limpieza de archivos al destruir/reescribir no borraba nada

## Problema

Hallazgo documentado en F4-75: `destroyRecord()` (y el flujo "reemplazar imagen"
de `updateRecord()`) **nunca borraban archivos de disco**. Causa: `getOldFiles()`
devolvía `$model->{$field}` tal cual, y la convención de almacenamiento es
**inconsistente en la BD**:

- `banners`, `categories`, `subcategories`, `brands`… guardan solo el *filename*
  (`68b53d4e….png`) → `public_path('68b53d4e….png')` no existe → `File::exists()`
  `false` → no se borra.
- `products` guarda la ruta completa (`data/products/f88a1eb7….png`) → sí
  coincidía, pero solo para esa convención.

Resultado: cada creación/borrado de entidad con imagen dejaba **huérfanos**
(png + thumbnail + variantes WebP) en `public/data/*`. Además `deleteOldFile()`
no eliminaba las variantes `.webp` que `processImage()` genera.

Verificado con log temporal en `destroyRecord`: `files:{"image":"…png"}`,
`exists:false`, y con la cuenta de `public/data/banners` (118 → 120 por cada
ciclo create+delete).

## Cambios

| Archivo | Cambio |
|---|---|
| `app/Traits/PostTrait.php` | `getOldFiles()` normaliza con el nuevo helper `resolveStoredPath()`: si el valor no contiene separador de ruta, prepone `imagePath`/`filePath`; si ya es ruta completa, se deja igual (compatibilidad con la convención de productos). `deleteOldFile()` además borra la variante `.webp` del original y del thumbnail (best-effort, solo si existe) |
| `tests/Feature/DestroyRecordCleanupTest.php` | **Nuevo**: 2 tests Pest — (1) destroy con convención *filename-only* borra png + webp + thumbnail + thumb-webp y el registro; (2) destroy con ruta completa (convención productos) borra el archivo en su sitio |

Sin cambios de comportamiento para el front ni la BD (las rutas solo se usan
para el borrado en disco).

## Verificación

- `php artisan test --compact` → **132 passed (706 assertions)** (+2 tests nuevos).
- **QA browser (one-shot, login admin `mjuchani`)**: mismo ciclo de F4-75
  (crear banner *"QA F4-75 split"* con PNG real → fila aparece → diálogo →
  *Eliminar* → fila fuera): `phase=done`, `found=true`, `stillThere=false`,
  **0 console errors / 0 requests fallidos** y `public/data/banners` **118 → 118**
  (antes quedaban +2 huérfanos por ciclo).
- `php -l` sin errores de sintaxis.
