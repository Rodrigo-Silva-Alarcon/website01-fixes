# Fix — Subcategorías e iconos del menú (Fase 4)

## Problema

- `Electrodomésticos`, `Cocina`, `Equipos de sonido` y `Consolas` no tenían
  subcategorías útiles ni iconos en `categories`/`subcategories` (icon vacío).
- El menú hover (`CategoriasMenu`) no mostraba submenús en categorías vacías;
  `Cocina` mostraba muebles (Sofás/Comedores) en lugar de la lista del Figma.
- Sin seeder de catálogo: el menú dependía de datos manuales en admin.

## Solucion

1. **`database/seeders/SubcategorySeeder.php`** (nuevo):
   - Iconos `TYPE_SVG_ICONS` en las 4 categorías y todas las subcategorías.
   - **Electrodomésticos:** Refrigeradoras, Lavadoras, Estufas (Figma + captura).
   - **Cocina:** Refrigeradores, Hornos, Microondas (Figma); Sofás/Comedores se
     dejan en BD con `active=false` para no romper FK de los productos 5-8.
   - **Equipos de sonido:** Parlantes, Auriculares y audifonos, Parlantes con
     bateria, Minicomponentes, Sound Bar (captura del usuario).
   - **Consolas:** Videojuegos, Accesorios, Mandos (lista propia; sin Figma).
   - `Cache::forget('web_menu')` al final del seed.
2. **`DatabaseSeeder`** registra `SubcategorySeeder`.
3. **`WebContentService::menu()`** ordena categorías y subcategorías por
   `order` + `id` (antes el orden de submenú era azar por id).

## Archivos modificados

- `database/seeders/SubcategorySeeder.php` (nuevo)
- `database/seeders/DatabaseSeeder.php`
- `app/Services/WebContentService.php`

## Verificacion

- `db:seed --class=SubcategorySeeder` → menú JSON con 4 categorías y
  submenús completos (Electrodomésticos 3, Cocina 3, Equipos de sonido 5,
  Consolas 3); iconos no vacíos.
- `npm run lint` → 0 errors (331 warnings pre-existentes)
- `artisan test --compact` → 118 passed (631 assertions)

## Commit

`feat(data): subcategorias e iconos del menu (F4-46)`
