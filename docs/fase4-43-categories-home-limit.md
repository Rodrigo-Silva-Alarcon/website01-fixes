# Fix — Limitar productos en categoriesHomeAll (Fase 4)

## Problema

§5.2.6: `WebContentService::categoriesHomeAll()` eager-loadaba **todos**
los productos activos de cada categoría (con inventory/category/
subcategory/brand) sin límite. Se usa en home (`BlockCategory`) y en
`/productos` (sidebar); el sidebar solo necesita `id`/`name`.

## Solucion

Límite de **8** productos por categoría en el eager load, con
`orderBy('order')->orderBy('id')` para orden estable:

```php
'products' => fn ($q) => $q->with([...])
    ->where('active', true)
    ->orderBy('order', 'ASC')
    ->orderBy('id', 'DESC')
    ->limit(8);
```

El carousel del home muestra máximo ~4 visibles (xl:basis-1/4) → 8 es
suficiente para dar sensación de abundancia sin cargar el catálogo
entero.

## Archivos modificados

- `app/Services/WebContentService.php`

## Verificacion

- `artisan test --compact` → 118 passed (631 assertions)
- Script PHP: conteo por categoría ≤ 8 (actual 4/4/0/0/0)
- Home recargado: secciones BlockCategory renderizan

## Commit

`perf(web): limita productos eager-load en categoriesHomeAll (Fase 4)`
