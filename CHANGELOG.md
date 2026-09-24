# Changelog

Todos los cambios notables de este fork de `website01` (prueba freelance de análisis técnico + fixes).

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

## [Unreleased] — Fase 4 (en curso)

### Added
- Búsqueda con debounce (F4-01)
- Botón eliminar en carrito offcanvas (F4-02)
- Headers de seguridad + CSP (F4-03)
- Conexión CMS Textos → frontend Inertia (`cmsTexts`) (F4-04)
- Programación de fechas de banners (`scheduled`) (F4-05)
- Flechas del hero carousel (F4-06)
- Exclusión de rutas admin del payload Ziggy (F4-07)
- Botón logout visible en sidebar (F4-08)
- Links RBAC en sidebar (Roles/Permisos/Textos) (F4-09)
- Títulos de navegador por página admin (F4-10)
- Stock por defecto `0` en inventarios (F4-11)
- Sección admin de Carritos (F4-12)
- Formulario de producto a 1200px + label en español (F4-13)
- Métricas de dashboard: stock bajo, pedidos recientes, revenue (F4-14)
- Precio + botón "Añadir al carrito" en cards de producto (F4-15)
- Links de categorías del menú sin `<button>` anidado (F4-16)
- Placeholder para imágenes de producto faltantes (F4-17)
- Footer configurable desde CMS sin placeholders (F4-18)
- Redirects **301** para rutas legacy con mayúsculas (F4-19)
- Eager loading en detalle de producto y carrito (F4-21)
- Placeholder de imagen en banner y carrito (F4-22)
- Permisos RBAC granulares de catálogo + middleware en rutas admin (F4-23)
- Variables de producción documentadas en `.env.example` (F4-24)
- Columna `image` en `categories`/`subcategories` + seed de imágenes de categoría (F4-30)
- Hero de inicio con banners seed + logos de marcas en `brands.image` (F4-32)
- Middleware `permission:` en dashboard/users/texts/images (§5.1.1 / F4-34)

### Fixed
- Import duplicado de `globals.css` en Home/About (F4-20)
- Política de contraseña: min 8 + letras + números (F4-25 / 5.1.6)
- Rutas admin Ziggy en payload SPA para autenticados (F4-27)
- CSP permite Vite HMR y Bunny Fonts; favicon SVG (F4-26)
- Sin desborde en tarjetas de destacados/banners (F4-28)
- Títulos de sección legibles en dark mode (`text-foreground`) (F4-29)
- Texto vertical en cards destacados (F4-31)
- Alturas/posición de imagen asimétricas en destacados (F4-32)
- Gates RBAC de catálogo en Create/Edit/Show (`create_*`/`edit_*`/`show_*` de sector) (F4-33)
- Gate de inventarios Create activado + Edit con `edit_inventories` (F4-33)
- Búsqueda de marcas ya no redirige a banners; link "volver" de producto (F4-33)
- Permiso de publicar textos: `publish_texts_texts` → `publish_texts` (F4-33)
- Contraste dark mode: feature strip/About `text-foreground` + strokes; hero `bg-white`; bordes ProductDetail/FindProducts (F4-35)
- Crop/upscale del banner hero: aspect cercano a 16:9 + `max-h` + `object-position` (F4-36)
- Banner hero Samsung pixelado: `object-contain` + asset `ab94c496…jpg` reemplaza `e002f7b5…png` (F4-37)
- "Añadir al carrito" siempre visible en cards del home (sin hover) (F4-38)
- Home con 5 categorías (Comida, Electrodomésticos, Cocina, Equipos de sonido, Consolas) (F4-39)
- Home con 10 marcas (renombre Mueblería Andes→Philips + Magafesa, Haier, Premier, Sony, Xiaomi, Hisense, Redragon) (F4-40)
- Mensajes flash de marca/banner/producto: textos copy-paste corregidos ("Baner"/"Bamer"/"Producto" en contextos erróneos) (F4-41)
- `SESSION_ENCRYPT=true` en `.env.example` (§5.1.10) (F4-42)
- `categoriesHomeAll()`: eager load de productos limitado a 8 por categoría (§5.2.6) (F4-43)
- Imágenes de los 8 productos alineadas con título; categoría Comida eliminada; imagen de Electrodomésticos corregida (F4-44)
- Logo nuevo Smart House (casa naranja + nodos azules + wordmark) en header/footer/admin/favicon (F4-45)
- Subcategorías e iconos del menú hover (4 categorías, seed + orden `order`) (F4-46)
- Productos para Equipos de sonido y Consolas en home (10 items con imagen/precio) (F4-47)
- Imagen del hero "Sobre nosotros" reemplazada (Unsplash, sirve desde public/) (F4-48)
- Checkout: form de pedido, orden+items+payment y página de éxito (F4-49)
- Stock: validación al agregar/cambiar cantidad y descuento al confirmar pedido (§5.3.1 / §5.3.5) (F4-50)
- Registro: redirect a home sin `access_dashboard` (§5.1.9) (F4-51)
- Precio de carrito: `COALESCE(offer_amount, amount)` si oferta activa sin monto (§5.3.9) (F4-52)
- Carrito: transacción + `lockForUpdate` + unique `cart_session` (§5.3.4) (F4-53)
- Catálogo: precio de oferta unificado con carrito v໚a isOnOffer/COALESCE (§5.3.6) (F4-54)

### Verified as already resolved
- §4.7.1 Logo SmartHouse, §4.7.5 Copyright, §4.7.9 Contacto 404, §4.7.10 Carrito offcanvas, §4.7.12 Lorem Ipsum, §4.5.5 `cookies.txt`, §4.4.3 Paginación (`link.url`), §4.2.2 Inertia condicional, §4.3.5 alt texts en componentes activos

## Fase 3 — Rendimiento y arquitectura (DONE, 7/7)

Ver `docs/fase3-*.md`:
- Relaciones eager-load en modelos
- Inertia share condicional
- Lazy load CSS/imágenes
- N+1 en marcas
- Code splitting
- Conversión WebP
- `WebTrail` → `WebContentService`

## Fase 2 — SEO / UX / Accesibilidad (DONE, 11/12)

Ver `docs/fase2-*.md`:
- Meta tags dinámicos, sitemap.xml, alt texts, contraste WCAG, Schema.org Product, `object-contain`, filtros por query GET, URLs minúsculas + 301, feedback carrito (toast), paginación, cache headers
- **Pendiente / bloqueado:** redes sociales footer con URLs reales del cliente

## Fase 1 — Bugs críticos (DONE, 16/16)

Ver `docs/fase1-*.md`:
- `cookies.txt`, reorder, GET→POST carrito, contacto 404, email user id, logo, copyright dinámico, rate-limit contacto, N+1, iconos menú, accessors N+1, Lorem Ipsum Nosotros, imágenes 404, precio tachado, checklist `.env`
- CI inicial (`.github/workflows`) + `.DS_Store` cleanup

---

## Pendientes / bloqueados (requieren cliente o decisión)

| Ítem | Motivo |
|---|---|
| §4.7.4 Nombres de producto placeholder | Datos reales desde admin |
| §4.7.6 Contraste blanco-naranja | Decisión de marca (WCAG parcial en Fase 2) |
| §4.7.8 Redes sociales con URLs reales | Datos del cliente |
| §4.4.4 Footer teléfono/dirección reales | Configurables vía CMS (F4-18); faltan valores |
| §4.4.7 Checkout completo | Alcance por confirmar (12-20h) |
| §4.8.2 Inventario faltante (16/75) | Datos desde admin |
| §4.8.3 Rol de usuario `example@website01.com` | Cambio en BD/admin |
| 26 vulnerabilidades npm | Triaje pendiente |
| reCAPTCHA (5.1.8) | Requiere site/secret keys del cliente |
| `Show.tsx` clonados de texts | Bug de plantilla; fix aparte |
