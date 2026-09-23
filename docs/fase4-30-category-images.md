# Fase 4 · Fix F4-30 — Imágenes de categorías (schema + datos)

## Problema

Las tarjetas de categorías de la home mostraban el placeholder genérico en vez de la imagen asignada. Causas en capas:

1. **Schema**: la migración `2025_09_19_095030_create_categories_table` nunca creó la columna `image`, aunque el modelo `Category` la declara en `$fillable` y expone `image_url` / `image_webp_url`. Mismo hueco en `subcategories`.
2. **Datos**: los archivos UUID existían en `public/data/categories/` pero las filas tenían `image` nulo (o inaccesible por la columna ausente).
3. **Ruta**: el modelo prepende `config('variables.folder_category')` (`data/categories/`) al valor guardado, por lo que hay que persistir solo el **basename** del archivo (no la ruta completa) para no duplicar el prefijo.

## Cambios

### Migración

`database/migrations/2026_09_23_000003_add_image_to_categories_subcategories.php`

- `categories.image` y `subcategories.image` (`string(250) nullable`) si no existen.
- Normalización defensiva de paths dobles (`data/categories/data/categories/...` → basename) por si se re-ejecuta el fix de datos con path completo.

### Datos (seed manual)

| Categoría | Archivo asignado |
|-----------|------------------|
| Electrodomésticos | `6321a305-c7fd-48eb-bb49-18ba45cbecdb.png` |
| Muebles | `b4ef08ce-6a72-436b-9c65-014937edd46f.png` |
| Ofertas | `42b1048a-07ba-4d01-b76b-e0993e581e9f.png` |

Verificado en navegador: las tres imágenes cargan con HTTP 200 (webp preferente) y `naturalWidth ≥ 900`.

## Limitaciones (fuera de alcance)

- **Brands**: resuelto en F4-32 (`brands.image` + assets en `data/banners/` vía `folder_banner`).
- **Contenido de imágenes de producto**: varios productos asocian un asset con contenido incorrecto (p. ej. Refrigeradora → teléfono). Es data quality del cliente; los archivos cargan correctamente (HTTP 200).
- **Banners**: tabla vacía y archivos huérfanos → seed en F4-32.

## Verificación

- `php artisan migrate` → `2026_09_23_000003` DONE
- `php artisan test --compact` → 111 passed (623 assertions)
- `npx tsc --noEmit` → sin errores
- `npm run build` → ok
- Navegador: 3 requests `/data/categories/*.webp` → 200; sin 404 de categorías
