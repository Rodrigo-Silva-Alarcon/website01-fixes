# F4-77 — Checkout básico: bug de cantidades, validación y página de éxito (§4.4.7)

## Problema

El flujo de checkout básico ya existía (form de datos de entrega, validación
server-side, `Order` + `OrderItem` + `Payment` con transacción, descuento de
stock y página de éxito), pero con cuatro huecos:

1. **Bug**: los botones −/+ del resumen de `CheckoutPage` y del carrito
   (`Carrito.tsx`) llamaban `router.patch('/Shop/{id}')` — la ruta está
   registrada como `/shop/{product}` (case-sensitive) → **404** y la cantidad
   nunca cambiaba.
2. El campo dirección **no pintaba** `errors.customer_address` (el resto de
   campos sí), y la dirección era opcional aunque el reparto la necesita.
3. Sin límite de envíos al `POST /checkout` (spam/doble submit).
4. `CheckoutSuccessPage` no pintaba los `order_items` aunque el controlador los
   cargaba: el cliente no veía qué compró.

## Cambios

| Archivo | Cambio |
|---|---|
| `pages/web/CheckoutPage.tsx`, `pages/web/imports/Carrito.tsx` | `PATCH /Shop/` → `PATCH /shop/` (2 sitios); añadido bloque de error `errors.customer_address` (mismo estilo que el resto); placeholder "y la mapa" → "y el mapa" |
| `app/Http/Controllers/CheckoutController.php` | Validación: `customer_phone` con `regex:/^[0-9+\s\-()]{6,40}$/` (mensaje custom), `customer_address` `required_unless:payment_method,whatsapp` (obligatoria salvo coordinar por WhatsApp) + mensajes |
| `routes/web.php` | `POST /checkout` → `->middleware('throttle:checkout')` |
| `app/Providers/AppServiceProvider.php` | Rate limiter `checkout`: 20/min **por sesión** de checkout |
| `pages/web/CheckoutSuccessPage.tsx` | Sección "Productos del pedido" con nombre × cantidad e importe de cada `order_item` |
| `tests/Feature/CheckoutTest.php` | +5 tests (teléfono inválido, dirección obligatoria salvo whatsapp, pedido sin dirección con whatsapp, `PATCH /shop` desde el resumen, items en la página de éxito); los 2 tests de flujo existentes ahora envían dirección (encajan con la validación nueva) |

## Verificación

- `php artisan test --compact` → **137 passed (731 assertions)** (+5).
- `npm run lint` → **0 errors / 217 warnings**; `npm run build` OK.
- **QA browser end-to-end (one-shot)**: añadir producto → `/checkout`:
  - botón **+** del resumen: cantidad **1 → 2** con 0 errores (antes 404);
  - submit con dirección vacía (transfer): se queda en `/checkout` y se pinta
    **"La dirección de entrega es obligatoria."** en el campo;
  - submit completo: redirige a `/checkout/exito/{id}` con h1 *"¡Pedido
    registrado!"*, sección **"Productos del pedido"** con su fila, **0 console
    errors / 0 requests fallidos**.
- Pedidos de prueba QA eliminados de la BD local al cerrar.

Quedan fuera de este alcance (alcance completo): panel admin de pedidos,
emails de confirmación, estados de pedido y protección anti-IDOR del enlace de
éxito.
