# Fix — Race condition en carrito (Fase 4)

## Problema

**§5.3.4:** `ShopController::add` creaba el carrito y los items sin
transacción ni lock. Dos requests concurrentes podían:

- crear dos `Cart` con la misma `cart_session` (token `md5(date)` con
  colisiones potenciales),
- insertar dos `CartItem` para el mismo producto,
- perder incrementos de cantidad (lost update).

## Solucion

- `DB::transaction` + `lockForUpdate()` sobre el carrito y el item.
- `Cart::firstOrCreate` por `cart_session` (idempotente).
- Token de sesión con `md5(uniqid(mt_rand))` en lugar de `md5(date)`.
- Stock chequeado dentro de la transacción; rollback devuelve `false`.
- Migración: dedupe de `carts.cart_session` + índice **unique**.

## Archivos modificados

- `app/Http/Controllers/ShopController.php`
- `database/migrations/2026_09_23_000001_add_unique_cart_session_to_carts_table.php`
- `tests/Feature/CartQuantityTest.php` (+2 tests)

## Verificacion

- `artisan test --compact --filter=CartQuantityTest` → **10 passed** (68 assertions)
- `artisan test --compact` → **128 passed** (686 assertions)
- lint → **0 errors** (330 warnings pre-existentes)

## Commit

`fix(cart): transaccion y lock en add + unique cart_session (F4-53)`
