# Fix — Precio de oferta con `offer_amount` NULL (Fase 4)

## Problema

**§5.3.9:** el `CASE` SQL de precio en `ShopController::add` devolvía
`offer_amount` cuando las fechas de oferta estaban activas; si
`offer_amount` era `NULL`, el precio del item del carrito quedaba en
`NULL` (subtotal/total corruptos).

## Solucion

En las tres ramas de oferta del `CASE`, usar
`COALESCE(offer_amount, amount)` para caer al precio base cuando no
hay monto de oferta configurado.

## Archivos modificados

- `app/Http/Controllers/ShopController.php`
- `tests/Feature/CheckoutTest.php` (+1 test fallback)

## Verificacion

- `artisan test --compact --filter=CheckoutTest` → **8 passed** (50 assertions)
- lint → **0 errors** (330 warnings pre-existentes)

## Commit

`fix(shop): coalesce offer_amount en precio de carrito (F4-52)`
