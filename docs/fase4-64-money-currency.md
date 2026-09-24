# F4-64 — Moneda: precios "Bo" → "Bs." (datos + display)

## Problema

QA visual: cards mezclaban `Bo 1599.00` y `Bs. 899.00` en la misma lista. Causa:

- Migración original `create_inventories_table` tenía default `'Bo'` → 8 inventories con `money='Bo'`, 10 con `'Bs.'`.
- `Price.tsx`, `Banner.tsx` y `Ofertas.tsx` renderizaban `inventory.money` crudo (el helper `currencyLabel` de `lib/cart.ts` solo se usaba en carrito/WhatsApp).

## Cambios

- `resources/js/pages/web/imports/Price.tsx`, `components/Banner.tsx`, `components/Ofertas.tsx`: precios públicos ahora usan `currencyLabel(inventory.money)` (normaliza BOB/BO/BS/BS. → `Bs.`).
- Migración `2026_09_24_000002_normalize_money_currency`:
  - UPDATE `inventories` y `cart_items` `money='Bo'` → `'Bs.'` (18/18 y 5/5 después).
  - Default de columna → `'Bs.'` (mismo patrón que `default_stock_zero_on_inventories`, `->change()` en SQLite).

## Verificación

- Migración aplicada; FKs de F4-62 intactas tras el rebuild (`PRAGMA foreign_key_list`: inventories→products, cart_items→carts, etc.).
- QA browser (home + /productos): `hasBo: false`, matches `Bs. 3299 / 2499 / 1899...`, 0 console errors.
- `php artisan test --compact` → 130 passed; `npm run lint` → 0 errors; `npm run build` OK.
