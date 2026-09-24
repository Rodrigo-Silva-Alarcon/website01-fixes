# F4-67 — Home/UI: flechas destacados, dropdown de categorías, h1 Productos, WhatsApp footer

## Problema

Reportes del usuario:

1. En la sección de destacados, la flecha izquierda del carrusel "acaparaba el espacio donde dice Comprar" (se superponía al botón de la primera card).
2. El menú de categorías del header desplegaba las subcategorías al pasar el mouse, pero el desplegable se ocultaba al mover el mouse para seleccionar una subcategoría.
3. El `h1` "Productos" (`text-[#191c1f]`) tenía problemas de visibilidad (texto casi negro); debe usar el mismo color que el título "Categorías" (`#006696`).
4. El botón de WhatsApp del footer redirigía a `+591 70000000` (placeholder); debe ser `+591 68210861`.

## Cambios

- `Banner.tsx` — flechas del carrusel destacados reposicionadas **encima de las cards** (`bottom-full mb-2`, en el padding `py-40/80` de la sección): ya no se superponen a ningún contenido de las cards.
- `CategoriasMenu.tsx` — eliminados `onMouseEnter`/`onMouseLeave` del `Link` trigger: al salir del Link hacia el submenú (elemento hermano) se disparaba `mouseleave` → `setHoveredItem(null)` → el desplegable se cerraba antes de poder seleccionar. El hover queda gobernado solo por el contenedor `relative` (el submenú es hijo, así que permanece abierto mientras el mouse recorra el desplegable).
- `ProductosPage.tsx` — `h1` "Productos": `text-[#191c1f]` → `text-[#006696]` (mismo azul que "Categorías").
- `2026_09_24_000003_update_footer_whatsapp_number.php` (nueva) — `texts.footer_whatsapp`: `59170000000` → `59168210861` (+ `Cache::forget('web_cms_texts')`). El footer (y Contacto) ya leen de CMS; `wa.me` de carrito/producto ya usaban `59168210861`.

## Verificación (QA browser, 1920)

- Flechas: bounding boxes no intersectan el botón "Comprar" (prev y=523 vs Comprar y=849); captura visual confirma flechas sobre las cards.
- Dropdown: submenú visible tras hover **y** tras mover el mouse al item "Refrigeradores" (`submenuVisibleAfterMove: true`).
- `/productos` → `h1` color `rgb(0, 102, 150)`.
- Footer → `href="https://wa.me/59168210861"`.
- 0 console errors; `php artisan test --compact` → 130 passed; `npm run lint` → 0 errors; `npm run build` OK.
