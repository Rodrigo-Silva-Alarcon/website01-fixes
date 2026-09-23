# Fix 28 — Relationships de modelos + schema order_items (Fase 3)

## Problema

`analisis-website01.md` §4.5.3: modelos sin relationships. Hallazgos al auditar:

| Modelo | Estado |
|---|---|
| `Brand` | **sin** `products()` / `inventories()` |
| `Banner` | **sin** `product()` (tenía `product_id` y accessors de label) |
| `Subcategory` | usaba `HasMany` **sin import** |
| `Image` | **sin** `imagetable()` morphTo |
| `Cart`, `CartItem`, `Product`, `Order`, `Payment`, `Inventory`, `Category` | OK |
| migración `order_items` | **incompleta**: solo `id + timestamps` (el modelo espera `order_id`, `product_id`, `name`, `image`, `amount`) |

## Solución

1. **`Brand`**: `products()`, `inventories()` (hasMany).
2. **`Banner`**: `product()` (belongsTo).
3. **`Subcategory`**: import de `HasMany`.
4. **`Image`**: `imagetable()` (morphTo).
5. **Migración** `2026_09_23_000000_complete_order_items_schema.php`: añade columnas faltantes de `order_items` con `Schema::hasColumn` guard (idempotente, seguro en DB existente).
6. **Tests** `tests/Feature/ModelRelationshipsTest.php` (8 casos): definición de relaciones + round-trips cart/category/order/inventory.

## Archivos modificados

- `app/Models/Brand.php`
- `app/Models/Banner.php`
- `app/Models/Subcategory.php`
- `app/Models/Image.php`
- `database/migrations/2026_09_23_000000_complete_order_items_schema.php` (nuevo)
- `tests/Feature/ModelRelationshipsTest.php` (nuevo)

## Verificación

- `artisan migrate` → migración `order_items` DONE.
- `artisan test --compact` → **86/86** (381 assertions).

## Fases

**Fase 3 (calidad)** — `analisis-website01.md` §4.5.3.
