# Fix — Productos faltantes en home (Fase 4)

## Problema

- **Equipos de sonido** y **Consolas** eran categorías del home con **0
  productos**: secciones vacías en la portada.
- Subcategorías creadas en F4-46 (Parlantes, Auriculares, Sound Bar,
  Videojuegos, Mandos, Accesorios…) no tenían catálogo.

## Solucion

1. **`database/seeders/ProductSeeder.php`** (nuevo) — 10 productos con
   inventario, precios BOB, stock y flags `pop`/`featured`:

   | Categoría | Productos |
   |---|---|
   | Equipos de sonido | Parlante Sony SRS-XB43, Auriculares Sony WH-CH520, Parlante Xiaomi Mi Portable, Minicomponente LG CM4550, Sound Bar Samsung HW-C450 |
   | Consolas | PS5 Slim, Xbox Series S, Nintendo Switch OLED, Mando Redragon G525, Headset Redragon H710 |

2. **Imágenes Unsplash** descargadas a `public/data/products/` con UUID +
   thumbs 400px (PowerShell .NET Drawing; GD no disponible en CLI).

3. **`DatabaseSeeder`** registra `ProductSeeder`.
4. Caches `web_populares` / `web_detacados` / `web_menu` olvidadas al seed.

## Archivos modificados

- `database/seeders/ProductSeeder.php` (nuevo)
- `database/seeders/DatabaseSeeder.php`
- `public/data/products/*.jpg` (10 full + 10 thumbs)

## Verificacion

- Home: las 4 categorías con productos (4/4/5/5); populares y destacados
  incluyen audio/consolas.
- 10 productos nuevos: `image_url` + `image_thumbs_url` no nulos; precios
  y stock en inventario.
- `npm run lint` → 0 errors (331 warnings pre-existentes)
- `artisan test --compact` → 118 passed (631 assertions)

## Commit

`feat(data): productos equipos de sonido y consolas (F4-47)`
