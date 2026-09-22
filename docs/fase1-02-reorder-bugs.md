# Fix 2 — Bugs de corrupción en `reorder()` de subcategorías y marcas

**Fase:** 1 — Crítico / Datos  
**Fecha:** 2026-09-22  
**Commit:** `fix(datos): corregir bugs de corrupcion en metodos reorder() (Fase 1)`

## Problema

Tres bugs en los controladores del panel de administración que corrompen datos al reordenar:

1. **`SubcategoryController::reorder()`** (`app/Http/Controllers/Admin/SubcategoryController.php:91`): usaba `Category::where(...)` en lugar de `Subcategory::where(...)` para actualizar el campo `order`. Al reordenar subcategorías, se modificaba el `order` de las **categorías principales** con IDs que no correspondían, corrompiendo el orden de las categorías del sitio.

2. **`BrandController::reorder()`** — validación (`app/Http/Controllers/Admin/BrandController.php:92`): la regla era `exists:products,id` en lugar de `exists:brands,id`. Cualquier ID de producto existente pasaba la validación, permitiendo que se reordenaran registros ajenos o se enviara basura al bucle.

3. **`BrandController::reorder()`** — clave del array (`app/Http/Controllers/Admin/BrandController.php:95`): el bucle recorría `$validated['products']` en lugar de `$validated['brands']`. El key `products` no existe en el array validado (la clave es `brands`), lo que provocaba un error/behavior incorrecto al intentar reordenar marcas.

## Solución

- `SubcategoryController.php:91`: `Category::where(...)` → `Subcategory::where(...)` sobre la entidad correcta.
- `BrandController.php:92`: `exists:products,id` → `exists:brands,id`.
- `BrandController.php:95`: `$validated['products']` → `$validated['brands']` (y nombre de variable `$brandId` coherente).

## Test funcional

Pruebas automáticas Pest: **no ejecutables localmente** (el `composer.lock` exige PHP ≥ 8.3 y el PHP local es 8.2.12; `composer install` falla por incompatibilidad de lock — limitación documentada del entorno).

Verificación estática realizada:

```text
# Sintaxis PHP válida en ambos archivos
php -l app/Http/Controllers/Admin/SubcategoryController.php
> No syntax errors detected

php -l app/Http/Controllers/Admin/BrandController.php
> No syntax errors detected

# Verificación de las tres correcciones en el diff
git diff
> -            Category::where('id', $Id)->update(...)
> +            Subcategory::where('id', $Id)->update(...)
> -            'brands.*' => ['required', 'integer', 'exists:products,id'],
> +            'brands.*' => ['required', 'integer', 'exists:brands,id'],
> -        foreach ($validated['products'] as $index => $Id) {
> +        foreach ($validated['brands'] as $index => $brandId) {
> -            Brand::where('id', $Id)->update(...)
> +            Brand::where('id', $brandId)->update(...)
```

**Resultado:** PASS — sintaxis correcta y las tres correcciones aplicadas según el diff.  
**Limitación:** sin suite Pest en local (bloqueo PHP 8.2 vs lock ≥ 8.3). En CI (`tests.yml`, PHP 8.4) las pruebas Feature cubren el panel solo si existen tests específicos de `reorder`; conviene añadir un test de regresión para `reorder` en subcategorías/marcas como parte de Fase 3 (tests).
