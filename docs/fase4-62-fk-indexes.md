# F4-62 — §2.7 Índices y foreign keys (SQLite/MySQL)

## Cambios

Migración `2026_09_24_000001_add_foreign_keys_and_indexes`:

- **Índices**: products (slug, category_id, subcategory_id, brand_id), categories/subcategories (slug), subcategories.category_id, carts.user_id, cart_items (cart_id, product_id), orders (card_id, user_id), order_items (order_id, product_id), payments (order_id, user_id), inventories.product_id, banners.product_id.
- **FKs aplicadas** (0 huérfanos locales): products.category_id, products.subcategory_id, subcategories.category_id, carts.user_id, cart_items.cart_id, order_items.order_id, payments.order_id, inventories.product_id, banners.product_id.
- **Solo índice (sin FK)** — tests usan sentinelas: products.brand_id, cart_items.product_id, order_items.product_id, orders.user_id, payments.user_id, orders.card_id → follow-up en MySQL de producción.

## Verificación

- Migración aplicada en `database.sqlite` local.
- `php artisan test --compact` → 130 passed.
