# Fix 3 — Convertir rutas addshop/removeshop de GET a POST (Fase 1)

## Problema

Las rutas de mutación del carrito estaban definidas como `GET`:

- `GET /AddShop/{product}` — añadir producto al carrito
- `GET /RemoveShop/{product}` — eliminar producto del carrito

Rutas de escritura vía GET son vulnerables a CSRF (cualquier enlace o
`<img>` puede dispararlas), no son idempotentes por diseño HTTP y rompen
la semántica REST. También hacían que los enlaces del frontend
(`<Link href={route('addshop')}>`) dispararan mutaciones al previsualizar
o al rastrear enlaces.

## Solución

1. **Rutas** (`routes/web.php:35,37`): `Route::get` → `Route::post`.
   Los nombres de ruta (`addshop` / `removeshop`) se mantienen, por lo
   que no cambian las URLs ni las referencias por nombre.
2. **Frontend (5 archivos)**: se reemplazó
   `<Link href={route('addshop'|'removeshop')}>` por un `<button>`
   que invoca `router.post(route(...))` de Inertia, preservando scroll
   (y estado en el carrito):
   - `resources/js/pages/web/components/Banner.tsx`
   - `resources/js/pages/web/components/Ofertas.tsx`
   - `resources/js/pages/web/imports/BlockCategory.tsx`
   - `resources/js/pages/web/imports/Carrito.tsx`
   - `resources/js/pages/web/ProductDetailPage.tsx`
3. **Test** (`tests/Feature/StorefrontTest.php:25-29`): las
   comprobaciones ahora usan `$this->post('/AddShop/99999')` y
   `$this->post('/RemoveShop/99999')` (además se añadió el chequeo de
   la ruta de borrado).

## Verificación

- `php -l routes/web.php` → sin errores de sintaxis.
- `php -l tests/Feature/StorefrontTest.php` → sin errores de sintaxis.
- Búsqueda de referencias: no quedan `Route::get('/AddShop'` /
  `Route::get('/RemoveShop'` ni usos de `route('addshop')` /
  `route('removeshop')` en `href` de `<Link>`.
- Las pruebas Pest no se pudieron ejecutar en local: el lock exige
  PHP ≥ 8.3 y la máquina tiene 8.2.12 (instalación de composer
  permanentemente bloqueada en este entorno); la validación se apoya en
  `php -l` + inspección estática. El CI (`tests/ci`) se encargará de
  correr la suite.

## Fase

Fase 1 — crítico (apartado "GET → POST" del informe de análisis).

## Commits

- `fix(seguridad): convertir addshop/removeshop de GET a POST (Fase 1)`
