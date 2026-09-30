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
- Deploy Render + Docker: `Dockerfile` multi-stage (assets → vendor → php8.3-fpm con nginx+supervisord y GD con WebP), `render.yaml` (Starter + disco1GB en `/persist`, session/cache/queue en BD), `deploy/entrypoint.sh` (uploads persistentes via symlink, migrate+seed condicional, config/view cache, puerto dinámico), `deploy/nginx.conf` (gzip + caché estática) y `.dockerignore` (la BD no viaja en la imagen); guía completa en `docs/fase4-82-deploy-render.md` (F4-82)
- `README.md` de levantamiento: stack, requisitos, instalación local paso a paso, usuarios seed (admin/editor/viewer), advertencia de que el seed **no crea catálogo** (con3 vías para obtenerlo), comandos útiles, estructura del proyecto, variables `.env`, tests (137), deploy Render y tabla de troubleshooting (F4-85)
- Paridad de clone: `database/database.sqlite` (744KB, catálogo completo:4 categorías,16 subcategorías,10 marcas,18 productos/inventarios,3 banners,2 pedidos,20 carritos,97 permisos,8 textos,3 usuarios admin/editor/viewer) versionada en git vía excepción `!database.sqlite` en `database/.gitignore`, más README con la sección "Base de datos incluida" (aviso de que `migrate:fresh --seed` destruye el catálogo y cómo restaurarla con `git checkout`); un clone arranca idéntico sin `touch`/`migrate`; detalle en `docs/fase4-86-paridad-repo.md` (F4-86)
- Informe Word (`Informe_Avances_Website01.docx`): nueva sección3.7 "Panel administrativo y CMS" (Problema/Solución/Verificación trazados a §6.6 y §13) con Figuras12–15 (dashboard con métricas, sidebar RBAC + cerrar sesión,97 permisos,8 textos); captions de Figura1 y Figura5 aclaran página inicial (logo «Lg» → Smart House) vs panel colapsado (guion16px → wordmark200×32, F4-78) y Figura5b recapturada con el wordmark actual; Tabla2 con fila "Panel y CMS", Tabla3 evidencia → Figuras12–15, Tabla4 +3 filas; métricas actualizadas (87 correcciones,118 informes,15 figuras, ESLint0/215,18 de75 productos,28-sep); detalle en `docs/fase4-87-informe-word.md` (F4-87)

### Changed
- Paleta completa: retematización de36 archivos de azul heredado (`#006696`/`#0088cc`/`#030213`) a naranja de marca (`--primary #ea580c`, superficies `#c2410c`/`#ffedd5`/`#fff7ed`) en tokens shadcn, utilidades Tailwind, imports Figma, páginas storefront/admin, login y layout de correos; barrido por ~40 rutas sin ocurrencias azules (F4-80)

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
- Carritos: prune diario de abandonados a 30 dias sin orden (§5.3.10) (F4-55)
- Footer: iconos Instagram y X/Twitter configurables via CMS (§4.7.8) (F4-56)
- Dependencias: npm audit fix redujo 26 vulnerabilidades a 2 (axios inertia, sin fix) (F4-57)
- Auth: Ziggy en `/login` incluye rutas admin → dashboard SPA ya no queda en blanco tras login (F4-58)
- Seguridad: throttle:5,1 en rutas de reset de contrasena + password rule admin letras/numeros (1.4/1.6) (F4-59)
- UI: home sin AOS (hueco blanco), contacto via cmsTexts, logo wordmark en login (F4-60)
- Codigo: typos WebTrail->WebTrait, get_detacados->get_destacados, tecnical_info->technical_info + migracion (7.5) (F4-61)
- DB: indices y foreign keys donde hay 0 huerfanos (2.7) (F4-62)
- Contacto: email branding Smart House (era "Red Agua"), validacion de mensajes en espanol y toast de exito/error al enviar (F4-63)
- Precios: moneda normalizada a "Bs." (datos Bo->Bs. + currencyLabel en Price/Banner/Ofertas) (F4-64)
- SEO: h1 en home, nosotros, productos, detalle de producto y busqueda (F4-65)
- Home: destacados convertido en carrusel con autoplay (4s) + viewport carousel sin desborde horizontal (F4-66)
- Home/UI: flechas de destacados sobre las cards (sin tapar Comprar), dropdown de categorias estable al mover el mouse, h1 Productos en #006696, WhatsApp del footer a +591 68210861 (F4-67)
- Carrito: botones intercambiados (WhatsApp primero) y "Finalizar pedido" renombrado a "Realizar Pedido" (F4-68)
- Checkout: fondo blanco fijo (modo oscuro incluido), titulo "Realizar pedido", cantidades +/- en el Resumen, TOTAL A PAGAR visible y mapa de Google embebido sincronizado con la direccion + CSP frame-src (F4-69)
- Checkout: mensaje de confirmacion "Pedido registrado" legible en modo oscuro (texto oscuro sobre tarjeta + fondo blanco) (F4-70)
- Dependencias: eliminado `@inertiajs/inertia` legacy (muerto, con axios 0.21.4 vulnerable sin fix); `npm audit` -> **0 vulnerabilidades** (F4-71)
- Admin: Show.tsx de banners/marcas/categorias/productos/subcategorias reescritos con sus entidades reales (antes eran clones de texts y crasheaban) + render con case correcto `Show` para Linux + checklist deploy con `db:seed` (permisos view_* catálogo) (F4-72)
- Admin: DataTable/CRUD generico `EntityIndex` para los 6 Index de catalogo (products/categories/subcategories/brands/banners/inventories); elimina ~1900 lineas duplicadas y corrige bugs de la plantilla (reorder brands/banners enviaba `products` -> 422, tipos/toasts de "Banner" en marcas, borrador "el texto", typos) (§7.1, F4-73)
- Admin: primitivas compartidas de formularios (`FormShell`, `Field`, `CheckboxField`, `ImageUploadField`, `useFormAlerts`) aplicadas a los _form de catalogo; corrige nombres de funcion y toasts "Texto"/"banner" mal copiados (§7.1, F4-74)
- Backend: `PostTrait` (god trait, 618 lineas, 14 controladores) dividido en `ImageHandling`, `FileUpload`, `Searchable` y `Paginatable` compuestos via `use` (controladores sin cambios; 618 -> 370 lineas); hallazgo documentado: limpieza de archivos en `destroyRecord` no borra nada por path incompleto (bug preexistente, candidato fix aparte) (§7.2, F4-75)
- Backend: fix limpieza de archivos - `getOldFiles()` normaliza filename-only vs ruta completa (`resolveStoredPath`) y `deleteOldFile()` borra variantes `.webp`; destruir/reemplazar imagenes ya no deja huérfanos en `public/data/*` (+2 tests Pest) (F4-76)
- Checkout: fix botones -/+ del resumen (`/Shop/` -> `/shop/`, antes 404); direccion obligatoria salvo pago por WhatsApp + formato de telefono validado + throttle 20/min por sesion en `POST /checkout`; error de direccion visible en el campo; pagina de exito lista los productos del pedido (+5 tests, 137 total) (4.4.7, F4-77)
- UI admin: fix logo del sidebar (se veia como un guion: `SidebarMenuButton` fuerza `[&>svg]:size-4` = 16x16 y aplanaba el wordmark 300x48) - wordmark 200x32 con `!important` y variante `icon` (casa) al colapsar; comparativa con el CMS original confirmada: menu admin y hero estan completos en la cuenta admin, roles de texto se quedan con RBAC actual (decision del usuario) (F4-78)
- Productos: fix 3 bugs de `/productos` - (1) checkboxes de categorias/marcas eran `type=submit` dentro del form: cada click navegaba, remontaba el componente y desmarcaba todo (ids llegan como string desde la URL, `includes(number)` fallaba) -> ahora `type=button` (selecciones acumulan), ids normalizados a `Number` y `preserveState` en Filtrar; (2) toggle "Mostrar/Ocultar filtros" no funcionaba en escritorio (`lg:block` lo forzaba visible + el boton interno navegaba y reseteaba el estado) -> pill siempre accesible al colapsar y `showFilters` inicial por viewport; (3) "Cargar mas" mapeaba `brands` completo asi que solo se escondia -> usa `displayedBrands` (5->10) y alterna a "Mostrar menos" con chevron rotado (F4-79)
- Locale: `.env.example` en español (`APP_LOCALE/APP_FALLBACK_LOCALE/APP_FAKER_LOCALE` = es/es_ES); validaciones y auth ya no aparecen en ingles (F4-81)
- Home: colision de prop `marcas` - `WebController` enviaba categorias bajo esa clave y el share de Inertia las pisaba (search contaminado); ahora `brands`/`get_marcas()` en `homepage()` y `products()`, componentes `Marcas`/`HomePage` leen `brands` (F4-81)
- Productos: empty state "No se encontraron productos" + ocultar `Pagination` sin paginas (el listado completo con `paginate(20)` y18 items sin paginacion es comportamiento correcto) (F4-81)
- Imagenes WebP sin HTTP 500: `ImageHandling::allowedMimes()` acepta `image/webp`; los4 `catch (\Exception)` de `PostTrait` (imagenes/archivos en create/update) pasan a `catch (\Throwable)` con helper `uploadError()` que traduce `imagecreatefromwebp` ausente (GD sin libwebp) a ValidationException amigable "El servidor no admite imagenes WebP; sube la imagen en PNG o JPG." (F4-81)
- QA CMS completo (marcas/categorias/subcategorias/permisos/textos/banners/productos/inventarios/users/roles/settings/appearance/carts):0 HTTP500,0 console errors; hallazgos documentados sin fix: `/admin/images` stub vacio, toasts genericos de `onError` en permissions/texts/inventories, select de inventario solo muestra productos activos sin inventario (por diseno) (F4-81)
- Perfil sin permisos: `/settings/profile` de un usuario sin rol quedaba en pantalla en blanco y su guard redirigia a `/admin/dashboard` (CheckPermission devolvia **403**); ahora el guard redirige a `/` con el toast de permisos (F4-83)
- QA como usuario (E2E): recorridos reproducibles de invitado (busqueda, filtro, detalle, carrito, drawer, checkout completo hasta `/checkout/exito/5`, contacto) y de auth (registro, sesion, logout, login admin, RBAC, credenciales invalidas en espanol) pasan con 0 console errors / 0 HTTP500; datos QA revertidos al baseline exacto (users3, orders2, carts20, stock identico); detalle en `docs/fase4-83-qa-usuario-e2e.md` (F4-83)
- Categorias del home: imagenes teñidas de naranja — las tarjetas usan `mix-blend-multiply` y el fondo crema de F4-80 multiplicaba los pixeles de las fotos (antes `#e0eef3` casi blanco); ahora sin multiply + tile blanco `rounded-[12px]` tras la imagen (color real uniforme en las4 tarjetas, las2 con fondo blanco opaco quedan seamless); detalle en `docs/fase4-84-categorias-tint.md` (F4-84)

- Credenciales fuera del repositorio: tabla de usuarios/contraseñas eliminada del README, login explicito borrado de `docs/fase4-82`, emails personales anonimizados en informes de fase, y `DatabaseSeeder` sin texto plano — contraseña via `SEED_PASSWORD` (aleatoria si no se define) y admin via `SEED_ADMIN_EMAIL` (default `admin@example.com`) (F4-88)

### Verified as already resolved (analisis-mejoras)
- 1.4 throttle POST /enviar ya existia; 8.3 CONTACT_EMAIL via config/contact.php; 7.6 ShopTrait si se usa (get_shop_cart); .DS_Store no tracked

### Verified as already resolved

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
| §4.7.8 Redes sociales con URLs reales | Datos del cliente |
| §4.4.4 Footer teléfono/dirección reales | Configurables vía CMS (F4-18); faltan valores |
| §4.4.7 Checkout — alcance completo | Alcance **básico** hecho (F4-77); panel de pedidos/emails/estados/anti-IDOR quedan para el alcance completo (12-20h) |
| §1.7 Archivos en storage/ | **Descartado por decisión**: rompería las URLs ya guardadas en la BD; sin valor visible para la demo |
| §4.8.2 Inventario faltante (16/75) | Datos desde admin |
| §4.8.3 Rol de usuario `example@website01.com` | Cambio en BD/admin |
