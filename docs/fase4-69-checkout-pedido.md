# F4-69 — Checkout: fondo blanco, "Realizar pedido", cantidades, total y mapa

## Problema

Reportes del usuario en el formulario de pedido (`/checkout`):

1. El fondo del formulario era **negro** (modo oscuro del sistema: `html.dark` sin estilos propios en la sección) con texto blanco e invisibles tarjetas de resumen — pedir fondo **blanco**.
2. El título `h1` "Finalizar pedido" → **"Realizar pedido"**.
3. En el Resumen no se podía **aumentar/disminuir la cantidad** de los productos añadidos, y el total a pagar debe mostrarse.
4. La casilla de dirección debe poder usar el **mapa de Google** para colocar la dirección de entrega.

## Cambios

- `CheckoutPage.tsx`:
  - Sección del formulario: `bg-white text-[#191c1f] [color-scheme:light]` — fondo blanco fijo (también en dark mode) y controles de formulario en esquema claro.
  - `h1`: "Finalizar pedido" → "Realizar pedido".
  - Resumen: botones `−` / `+` por item con `aria-label` que llaman `router.patch('/Shop/{product_id}', { amount }, { preserveState, preserveScroll })` (mismo endpoint que el offcanvas; `preserveState` mantiene los datos ya escritos en el formulario). Subtotal por item y **"TOTAL A PAGAR: Bs. …"** en el bloque de totales.
  - Dirección: mapa de Google embebido **sin API key** (`https://www.google.com/maps?q={dirección}&output=embed`) debajo del input, sincronizado con debounce de 600ms (`mapQuery`); por defecto muestra La Paz. (Clic para fijar punto requiere API key — decisión del usuario: mapa embebido.)
- `SecurityHeaders.php` — CSP `frame-src 'self' https://www.google.com https://maps.google.com https://maps.googleapis.com` (antes `default-src 'self'` bloqueaba el iframe).
- `SecurityHeadersTest.php` — aserción del nuevo `frame-src`.

## Verificación (QA browser, claro + `colorScheme: dark`)

- `h1` = "Realizar pedido"; sección `background: rgb(255,255,255)` y `color: rgb(25,28,31)` en **ambos** esquemas (`htmlDark: true` verificado).
- Resumen: 2 botones de cantidad (−/+) para 1 item; `TOTAL A PAGAR: Bs. 3299.00`.
- Mapa: `src` inicial `…/maps?q=La%20Paz%2C%20Bolivia&output=embed`; al escribir "Av. Arce, La Paz" → `src` = `…/maps?q=Av.%20Arce%2C%20La%20Paz&output=embed` (debounce funcionando); iframe carga sin errores.
- 0 console errors, 0 requests fallidos; `php artisan test --compact` → 130 passed (699 assertions); `npm run lint` → 0 errors; `npm run build` OK.
