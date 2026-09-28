# F4-81 — Lote QA: locale español, colisión de prop `marcas`, empty state y subida WebP con HTTP 500

Ronda de pruebas funcionales (storefront + CMS) que destapó cuatro defects.

## 1. Locale en inglés (`F4-81a`)

**Problema**: mensajes de validación y de auth en inglés
("The email field must be a valid email address.", "These credentials do not
match...") aunque `lang/es/*` existía completo.

**Causa**: `.env` con `APP_LOCALE=en`, `APP_FALLBACK_LOCALE=en`,
`APP_FAKER_LOCALE=en_US` (el `.env.example` ya traía `es`).

**Fix**: los tres a `es` / `es_ES`.

**Verificación**: login inválido → "Estas credenciales no coinciden con
nuestros registros."; registro de producto sin nombre → "El nombre es
obligatorio."

## 2. Colisión de prop `marcas` en home (`F4-81b`)

**Problema**: `Marcas` recibía las categorías en su prop `marcas`.

**Causa**: `WebController::homepage()` pasaba `'marcas' => get_marcas()` y el
share de Inertia (que aporta las **categorías** de menú bajo la clave
`marcas`, ver `HandleInertiaRequests`) pisaba el valor → el componente
mapeaba categorías como si fueran marcas (y el search del home devolvía
contaminado: `/productos?find=Parlante` sin filtro correcto).

**Fix**: `homepage()` y `products()` ahora envían `'brands' => get_marcas()`;
`Marcas.tsx` lee `brands` del `usePage` y `HomePage.tsx` renombra
`marcas→brands` en sus props.

**Verificación**: search desde home → `/productos?find=Parlante&page=1` con
resultados correctos (2 cards, sin contaminación).

## 3. Empty state en `/productos` sin resultados (`F4-81c`)

**Problema**: búsquedas/filtros sin resultados mostraban la página en blanco
con la paginación vacía.

**Fix**: `ProductosPage.tsx` muestra "No se encontraron productos" +
"Prueba con otros filtros o palabras de búsqueda." y oculta `Pagination`
cuando no hay links de páginas (≤ 3 links = 1 página).

**Nota (no-bug)**: con 18 productos y `paginate(20)` solo hay 1 página: la
paginación ausente en el listado completo es comportamiento correcto.

## 4. Subir imagen WebP → HTTP 500 (`F4-81d`)

**Problema**: crear marca/categoría/banner con `.webp` devolvía **500** y la
pantalla quedaba en blanco (dos errores en cascada):

1. `ImageHandling::allowedMimes()` no incluía `webp` → `Exception` "El
   archivo debe ser una imagen válida (JPEG, PNG, JPG, GIF)".
2. Tras ampliar la whitelist, el GD de algunos entornos (incl. el local)
   **no tiene `imagecreatefromwebp`** → Intervention lanza `\Error`, que los
   `catch (\Exception)` originales de `PostTrait` **no atrapaban** → 500 otra
   vez.

**Fix**:

| Archivo | Cambio |
|---|---|
| `app/Traits/ImageHandling.php` | whitelist de mimes + `image/webp` y mensaje + "(JPEG, PNG, JPG, GIF, WEBP)" |
| `app/Traits/PostTrait.php` | los 4 `catch (\Exception)` de `createRecord`/`updateRecord` (imágenes y archivos) pasan a `catch (\Throwable)` con helper `uploadError()` que convierte el fallo en `ValidationException`; si el error es `imagecreatefromwebp` traduce a "El servidor no admite imágenes WebP; sube la imagen en PNG o JPG." |

**Verificación**: ronda browser con `.webp` → **0 respuestas ≥ 500** y mensaje
amigable en el form (quedado en `/admin/brands/create`); con PNG el CRUD
completo pasa (marca/categoría/banner creadas y borradas). En producción
(GD con libwebp) el WebP se procesa con normalidad.

## Hallazgos CMS documentados (sin fix, por diseño o fuera de alcance)

- **`/admin/images` en blanco**: `ImageController::index()` y `create()` son
  métodos vacíos (stub). La galería real vive en `products/_form.tsx`
  (`images.store`/`images.destroy` vía axios). No hay link en el sidebar.
- **Toasts genéricos de error**: `permissions/_form.tsx`,
  `texts/_form.tsx`, `inventories/_form.tsx` muestran "Error al crear X" en
  `onError` aunque los errores inline por campo sí se renderizan.
- **Select de producto vacío en "Crear inventario"**: el controller filtra
  `whereDoesntHave('inventory')` — solo muestra productos activos **sin**
  inventario (una fila por producto). No es bug; probado creando primero un
  producto nuevo.
- **Producto nuevo nace inactivo** (`active: product.active` → `null`):
  hay que marcar "Publicar" manualmente.
- **Detalle de producto sin selector de cantidad** (añade 1; la cantidad se
  ajusta en el drawer): decisión de diseño, no bug.

## Verificación global

- QA browser CMS (rondas A–E): brands, categories, subcategories,
  permissions, texts, banners, products, inventories, users, roles,
  settings (profile update+revert, password con actual incorrecta,
  appearance dark/light), carts list — **todos pasan**; **0 console
  errors / 0 requests fallidos / 0 HTTP 500** en las rondas finales.
- BD restaurada al baseline tras la limpieza de datos QA
  (brands 10, categories 4, subcategories 16, texts 8, banners 3,
  products 18, inventories 18, users 3, carts 15, roles 3, permissions 97).
- `php -l` en los dos traits modificados → sin errores;
  `npm run build` OK; `npm run lint` → **0 errors / 215 warnings**.
