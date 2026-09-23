# Fase 4-11 — Stock de inventario por defecto 0 (§4.8.6)

## Problema

Algunos registros de inventario tenían `stock` NULL → celda vacía en la tabla
y formularios que no precargaban valor.

## Cambios

| Archivo | Cambio |
|---|---|
| `database/migrations/..._default_stock_zero_on_inventories.php` | Backfill `NULL → 0` y `default(0)` en la columna |
| `app/Models/Inventory.php` | Accessor `getStockAttribute`: `null` → `0` |
| `resources/js/pages/admin/inventories/Index.tsx` | `{inventory.stock ?? 0}` en la celda |
| `resources/js/pages/admin/inventories/_form.tsx` / `_form_modal.tsx` | `String(inventory.stock ?? 0)` como valor inicial del input |

`InventoryRequest` sigue aceptando `nullable` (null se guarda como 0 vía default/accesor).

## Verificación

- `artisan migrate --force` → DONE
- `artisan test --compact` → **94 passed (429 assertions)**
- `npx tsc --noEmit` → OK

## Commit

`fix(inventory): stock por defecto 0 y sin celdas vacías (Fase 4)`
