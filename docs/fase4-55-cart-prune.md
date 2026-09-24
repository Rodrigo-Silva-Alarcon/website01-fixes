# Fix - Expiracion de carritos abandonados (Fase 4)

## Problema

**§5.3.10:** no existia limpieza de carritos; los abandonados se
acumulaban indefinidamente en `carts`/`cart_items`.

## Solucion

- Comando `carts:prune` (`--days=30` por defecto): elimina carritos sin
  actividad mayor al cutoff que **no tengan pedidos** asociados.
- `Schedule::command('carts:prune')->daily()` en `routes/console.php`.

## Archivos modificados

- `app/Console/Commands/PruneCarts.php` (nuevo)
- `routes/console.php`
- `tests/Feature/CartPruneTest.php` (nuevo)

## Verificacion

- `artisan test --compact --filter=CartPruneTest` -> **1 passed** (4 assertions)
- `artisan test --compact` -> **129 passed** (690 assertions)
- lint -> **0 errors** (330 warnings pre-existentes)

## Commit

`feat(cart): prune de carritos abandonados a los 30 dias (F4-55)`