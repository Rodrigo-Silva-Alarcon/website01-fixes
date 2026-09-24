# F4-68 — Carrito offcanvas: orden de botones y renombrar

## Problema

Reporte del usuario: en la pestaña (offcanvas) del carrito, el botón "Finalizar pedido" debe intercambiarse de lugar con "Solicitar pedido por WhatsApp", y "Finalizar pedido" pasa a llamarse "Realizar Pedido".

## Cambios

- `Carrito.tsx` — `Frame10124106`: ahora el orden es
  1. `Solicitar pedido por WhatsApp` (outline, `target="_blank"` → `wa.me`),
  2. `Realizar Pedido` (naranja sólido → `/checkout`).

## Verificación (QA browser)

- Offcanvas abierto con 1 producto: `[data-name="Botón3"]` (WhatsApp) en índice 0, `[data-name="BotonCheckout"]` en índice 1; texto `Realizar Pedido`.
- 0 console errors; `php artisan test --compact` → 130 passed; `npm run lint` → 0 errors.
