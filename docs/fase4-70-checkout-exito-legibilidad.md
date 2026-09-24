# F4-70 — Checkout success: legibilidad del mensaje de confirmación

## Problema

Reporte del usuario: después de enviar el formulario, la página que muestra "¡Pedido registrado!" tiene las letras en blanco sobre fondo claro — no se puede leer el mensaje (Número de pedido, Estado, Total, etc.).

Causa: la tarjeta del resumen es `bg-[#f2f4f5]` pero el `<section>` no definía fondo ni color de texto; el texto heredaba el color del body. En modo oscuro del sistema (`html.dark`, preferencia del usuario) el body es claro sobre oscuro → texto blanco sobre tarjeta gris claro = ilegible. Mismo patrón ya corregido en F4-69 para el formulario.

## Cambios

- `CheckoutSuccessPage.tsx` — sección del contenido: `py-16` → `py-16 bg-white text-[#191c1f] [color-scheme:light]` (fondo blanco fijo y texto oscuro también en dark mode, consistente con el formulario de checkout).

## Verificación (QA browser, `colorScheme: dark`, `/checkout/exito/1`)

- `htmlDark: true`; texto del `<p>` = `rgb(25, 28, 31)`; tarjeta = `rgb(242, 244, 245)`; sección = `rgb(255, 255, 255)` → contraste correcto.
- Píxeles de la captura: (960,500) = `rgb(242,244,245)` (tarjeta), fondo de sección blanco — confirma el contenido capturado.
- 0 console errors; `php artisan test --compact` → 130 passed; `npm run lint` → 0 errors; `npm run build` OK.
