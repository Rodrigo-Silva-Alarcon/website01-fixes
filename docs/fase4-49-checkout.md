# Fix — Checkout (opción B, Fase 4)

## Problema

- **§4.4.7 / §5.3.2:** tablas `orders`/`order_items`/`payments` existen
  pero no hay ruta, controlador ni UI de checkout; el flujo de compra
  terminaba solo en WhatsApp desde el carrito.

## Solucion (opción B condicional)

1. **Migración** `2026_09_23_120000_add_checkout_fields_to_orders.php`:
   - `orders`: `customer_name`, `customer_phone`, `customer_email`,
     `customer_address`, `notes`, `status`, `payment_method` (nullable
     para no romper fixtures existentes).
   - `order_items`: `quantity`, `unit_price`.
2. **`CheckoutController`**: `GET /checkout` (formulario con resumen),
   `POST /checkout` (transacción: Order + OrderItems + Payment
   `tipe_pay`, limpia carrito), `GET /checkout/exito/{order}`.
3. **UI Inertia**: `CheckoutPage.tsx` + `CheckoutSuccessPage.tsx`;
   botón “Finalizar pedido” en el carrito; WhatsApp como respaldo.
4. **Modelos**: fillable/casts de `Order` y `OrderItem` ampliados.

## Archivos modificados

- `database/migrations/2026_09_23_120000_add_checkout_fields_to_orders.php`
- `app/Http/Controllers/CheckoutController.php` (nuevo)
- `routes/web.php` (checkout)
- `app/Models/Order.php`, `app/Models/OrderItem.php`
- `resources/js/pages/web/CheckoutPage.tsx`, `CheckoutSuccessPage.tsx`
- `resources/js/pages/web/imports/Carrito.tsx`
- `resources/js/types/models.ts`
- `tests/Feature/CheckoutTest.php` (nuevo)

## Verificacion

- `artisan migrate` OK; lint → **0 errors** (340 warnings pre-existentes)
- `artisan test --compact` → **123 passed** (672 assertions)
  (5 tests CheckoutTest: render, vacío, validación, creación, success)

## Commit

`feat(checkout): formulario de pedido y confirmacion (F4-49)`
