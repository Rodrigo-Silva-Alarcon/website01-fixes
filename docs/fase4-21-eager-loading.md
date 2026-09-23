# Fase 4-21 — Eager loading restante N+1 (§4.2.1)

## Problema

Eager loading parcial en dos puntos:
1. `productDetail` solo cargaba `images, inventory` → lazy-load de `category/subcategory/brand` en detalle y JSON-LD.
2. `get_shop_cart` solo cargaba `cartItems` → N+1 de `product` (+ inventory/images) al renderizar el offcanvas.

## Cambios

| Archivo | Cambio |
|---|---|
| `app/Services/WebContentService.php` | `productDetail` → `with(['images', 'inventory', 'category', 'subcategory', 'brand'])` |
| `app/Traits/ShopTrait.php` | `get_shop_cart` → `with(['cartItems.product.inventory', 'cartItems.product.images'])` |

## Verificación

- `artisan test --compact` → **105 passed (577 assertions)**
- `npx tsc --noEmit` → OK

## Commit

`perf(web): eager loading en detalle de producto y carrito (Fase 4)`
