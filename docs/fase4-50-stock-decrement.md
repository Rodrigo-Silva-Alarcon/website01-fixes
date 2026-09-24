# Fix — Stock al confirmar pedido (Fase 4)

## Problema

- **§5.3.1:** el stock nunca se decrementaba al comprar; el inventario
  quedaba desactualizado tras cada pedido.
- **§5.3.5:** se podía agregar al carrito / cambiar cantidad sin
  verificar stock disponible.

## Solucion

1. **`CheckoutController::store`**: dentro de la transacción, lock de
   `inventories` por producto (`lockForUpdate`), validación
   `stock >= cantidad` y `decrement('stock', qty)` solo si hay fila de
   inventario. Si falta stock → rollback + redirect a `/checkout` con
   mensaje (no se crea la orden).
2. **`ShopController::add`**: rechaza si `stock < cantidad` (nueva o
   incremento del item).
3. **`ShopController::update`**: rechaza si la nueva cantidad supera el
   stock del inventario del producto.

## Archivos modificados

- `app/Http/Controllers/CheckoutController.php`
- `app/Http/Controllers/ShopController.php`
- `tests/Feature/CheckoutTest.php` (+2 tests stock)

## Verificacion

- `artisan test --compact` → **125 passed** (679 assertions)
  (decremento 5→3 y rechazo con stock 1 / cantidad 3)
- lint → **0 errors** (330 warnings pre-existentes)

## Commit

`feat(checkout): validar y descontar stock al confirmar pedido (F4-50)`
