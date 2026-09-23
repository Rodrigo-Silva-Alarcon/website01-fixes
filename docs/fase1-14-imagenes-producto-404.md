# Fix 14 — Imágenes de producto 404 por ruta duplicada (Fase 1)

## Problema

Las tarjetas del home (y cualquier listado) mostraban **imágenes rotas**. En red, las peticiones eran:

```
/data/products/data/products/<uuid>.png  → 404
```

Causa: en la BD el campo `image` ya guarda la ruta relativa completa (`data/products/<uuid>.png`, ver seed y `PostTrait::processImage`), pero los accessors **volvían a anteponer** `config('variables.folder_product')` (`data/products/`):

```php
// Product.php (antes)
$imagePath = str_replace('storage/', '', $this->image);
return asset(config('variables.folder_product') . $imagePath);
```

Resultado: prefijo doble → 404 → icono de imagen rota en UI.

## Solución

Helper privado `productImagePath()` en `Product` y `CartItem`:

1. Quitar prefijo `storage/` si existe.
2. Si la ruta **ya empieza** con el folder configurado, no anteponerlo otra vez.
3. Para thumbs, insertar `thumbs/` solo una vez dentro del folder.

Misma lógica en `image_url`, `image_thumbs_url`, `tecnical_image_*` (Product) y en los accessors de `CartItem` (el carrito copia el path del producto).

## Archivos modificados

- `app/Models/Product.php`
- `app/Models/CartItem.php`

## Verificación

- `php -l` limpio en ambos modelos.
- Tinker: `image_url` = `.../data/products/<uuid>.png`, `image_thumbs_url` = `.../data/products/thumbs/<uuid>.png`; ambos archivos existen en disco.
- Navegador home: 8 GET de `/data/products/*.png` con **200**; `img.naturalWidth = 800` en las 4 primeras cards; sin errores de consola.

## Fases

**Fase 1 (crítico / media)** — imágenes de producto rotas en home y catálogo (`analisis-website01.md` §4.7 — assets / presentación).
