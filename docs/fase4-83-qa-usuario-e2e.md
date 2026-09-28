# F4-83 — QA como usuario: recorridos E2E (invitado + auth) y perfil sin permisos

Ronda de pruebas ejecutadas **como si fuera un usuario final** sobre el sitio
local (`http://127.0.0.1:8000`), con browser automation (recorridos
reproducibles `ut_shop`, `ut_shop3`, `ut_auth2`). Un solo defecto nuevo
destapado; el resto de los recorridos pasa limpio.

## 1. Recorrido como invitado — compra completa

| Paso | Resultado |
|---|---|
| Home (h1 +62 links) | ✅ |
| Filtro por categoría → `/productos?cs%5B0%5D=2` (8 cards) | ✅ |
| Detalle de producto (Parlante Sony SRS-XB43, precio) | ✅ |
| Búsqueda desktop (header) → `/productos?find=Parlante&page=1` (6 hits) | ✅ |
| Añadir al carrito → toast | ✅ |
| Drawer del carrito (botón header → "Mi carrito") | ✅ |
| Navegación a checkout desde el drawer ("Realizar Pedido") | ✅ |
| Llenado de checkout (7 inputs, pago `transfer`) y confirmación → `/checkout/exito/5` con "Pedido registrado" | ✅ |
| Formulario de contacto (4 campos) | ✅ |
| Envío de contacto → toast | ✅ |

**0 console errors / 0 requests fallidos / 0 HTTP 500.**

Dos falsos positivos iniciales del propio script (no del sitio): el header no
es tag `<header>` (es `div[data-name="Header"]`) y "Realizar Pedido" es un
`<Link>` (`<a data-name="BotonCheckout">`), no un `<button>`; verificado en
retest con selectores correctos.

## 2. Recorrido de auth — registro / logout / login / RBAC

| Paso | Resultado |
|---|---|
| Registro público (`Password123`, política min8+letras+números) → redirect a home | ✅ |
| Sesión activa tras registro (`GET /settings/profile` → 200) | ✅ |
| Logout (`POST /logout`) → login visible | ✅ |
| Login admin → `/admin/dashboard` con widgets | ✅ |
| Admin protegido tras logout → `/login` | ✅ |
| Login inválido → "Estas credenciales no coinciden con nuestros registros." | ✅ |

**0 console errors / 0 requests fallidos.**

## 3. Defect: `/settings/profile` sin permiso → pantalla en blanco + HTTP 403 (`F4-83`)

**Problema**: un usuario recién registrado (sin rol → sin permiso
`view_profile`) que visita `/settings/profile` quedaba en una **página en
blanco**; en consola aparecía **`HTTP 403 /admin/dashboard`** y un toast de
permisos que se perdía contra el fondo vacío.

**Causa**: `resources/js/pages/admin/settings/profile.tsx` hacía
`return null` (sin layout) y en el `useEffect` redirigía con
`router.visit('/admin/dashboard')`; `CheckPermission` devolvía **403** a ese
usuario (no tiene acceso al dashboard), así que el guard dejaba la vista en
un callejón.

**Fix**: la redirección del guard ahora va a `/` (home), que siempre es
accesible; se conserva el toast "No tienes permisos para ver el perfil".

**Verificación**: retest del recorrido de auth → perfil 200, redirect a `/`,
**403 eliminado** (0 console errors, 0 requests fallidos), y los6 pasos del
recorrido pasan.

## 4. Limpieza y baseline

La ronda de pruebas creó (y se revirtió) datos QA en `database/database.sqlite`:

- Orden QA `id5` + `order_items`/`payments` `id5` eliminados; stock del
  producto9 restaurado de6 a **7**.
- Carritos QA `26–28` + sus items borrados.
- Usuarios QA `qa.user.%@example.com` (3 registros de prueba) borrados.

Estado final idéntico al baseline previo: **users=3, orders=2 (1,4),
order_items=2, payments=2, carts=20 (max id24), stock por inventario
{1:10,2:8,3:4,4:6,5:4,6:3,7:2,8:7,9:7,10:20,11:15,12:6,13:8,14:5,15:7,16:25,17:18,18:9}**.

## Verificación global

- `npm run build` OK; `npm run lint` → **0 errors / 215 warnings** (baseline).
- Evidencia (capturas `ut-*.png`): `%TEMP%\opencode\doc-shots\`.
- Scripts de recorrido: `%TEMP%\opencode\ut_shop*.mjs`, `ut_auth2.mjs`
  (fuera del repo; el baseline de BD `ut_baseline.php` fue eliminado).
