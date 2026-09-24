# F4-65 — SEO: `h1` en páginas públicas

## Problema

QA: `home`, `/nosotros`, `/productos`, `/marcas/*` y detalle de producto no tenían ningún `<h1>` (solo Contacto/Checkout/Cuenta/Login sí lo tenían). Impacto SEO/accesibilidad.

## Cambios

- `HomePage.tsx`: `h1` sr-only "Smart House — Tecnología y electrodomésticos para tu hogar" (el hero es slideshow, sin título visible; sr-only no altera el diseño).
- `AboutHeroSection.tsx`: el título hero "Sobre Smart House Bolivia" `p` → `h1` (mismas clases, sin cambio visual).
- `ProductosPage.tsx`: `h1` visible "Productos" sobre el grid (compartido por `/productos`, `/productos/{cat}`, `/marcas/{id}` — misma página Inertia).
- `ProductDetailPage.tsx`: nombre del producto `p` → `h1` (mismas clases).
- `FindProductsPage.tsx`: "Resultados de búsqueda" `p` → `h1`. Nota: esta página no tiene ruta en `routes/web.php` (huérfana de plantilla); el cambio queda por si se conecta.

## Verificación (QA browser)

- `/` → h1 `Smart House — Tecnología y electrodomésticos para tu hogar`
- `/nosotros` → h1 `Sobre Smart House Bolivia`
- `/productos` y `/productos?find=samsung` → h1 `Productos`
- `/productos/Electrodomesticos/Refrigeradoras/Refrigeradora-samsung-400l` → h1 `Refrigeradora Samsung 400L`
- 0 console errors; `php artisan test --compact` → 130 passed; `npm run lint` → 0 errors; `npm run build` OK.
