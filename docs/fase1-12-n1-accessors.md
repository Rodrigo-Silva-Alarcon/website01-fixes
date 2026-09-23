# Fix 12 — N+1 en accessors de Product/Banner/Subcategory (Fase 1)

## Problema

`Product::$appends` incluye `category_label`, `category_slug`, `subcategory_label`, `subcategory_slug` y `brand_label`. Cada accessor hacía `Model::pluck(...)` **una vez por instancia serializada**, generando hasta 5 queries extra por producto en listados (home, banners, detalle) — el hallazgo CRÍTICO `5.2.1` / `4.2.1` del análisis.

`Banner` y `Subcategory` tenían el mismo patrón de `pluck` por acceso.

## Solución

En los accessors de `Product`, `Banner` y `Subcategory`:

1. Si la relación ya está `relationLoaded`, usar `$this->category->name` (etc.) sin query extra.
2. Si no, cachear el `pluck` en un `static` de la función (1 query por proceso/petición, no por fila).

Además se eager-loadan `category`, `subcategory` y `brand` en:

- `WebTrail::get_populares()` / `get_detacados()` / `get_categories_home_all()`
- related products en `WebController@product`

Así la rama `relationLoaded` evita por completo los `pluck`.

## Archivos modificados

- `app/Models/Product.php` — 5 accessors
- `app/Models/Banner.php` — 2 accessors
- `app/Models/Subcategory.php` — 2 accessors
- `app/Traits/WebTrail.php` — `with([...])` en populares/destacados/categorías home
- `app/Http/Controllers/WebController.php` — related products + relaciones

## Verificación

- `php -l` sin errores en los 3 modelos.
- Tinker con query log sobre 4 productos: cada `pluck` corre **una sola vez** (no 4); con relaciones eager-loaded los accessors usan la relación y no disparan `pluck`.
- Home y `/Nosotros` responden 200.

## Fases

**Fase 1 (crítico / rendimiento)** — N+1 de accessors (`analisis-website01.md` §4.2.1, tabla 5.2.1).
