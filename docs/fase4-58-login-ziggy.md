# Fix - Ziggy sin rutas admin en /login → dashboard en blanco tras login (Fase 4)

## Problema

**Hallazgo durante auditoría visual final.** Tras iniciar sesión con el formulario
Inertia de `/login`, la URL cambiaba a `/admin/dashboard` pero `#app` quedaba
vacío (pantalla en blanco). Un full reload manual del dashboard sí renderizaba.

Causa raíz:

1. `ExcludeAdminZiggyRoutes` emite el payload Ziggy del GET `/login` **sin**
   rutas admin (`admin.*`, `products.index`, …) porque el usuario aún es anónimo.
2. El login es un POST Inertia que redirige (302) al dashboard **sin recargar
   el HTML**: el script Ziggy de `/login` persiste en la SPA.
3. `admin/dashboard` llama `route('products.index')` al montar → Ziggy no tiene
   la ruta → el render falla → `#app` queda vacío.

El propio middleware ya anticipaba el caso "SPA desde /login" en un comentario
(autenticados), pero no cubría el GET anónimo de `/login` que es el que genera
el Ziggy inicial.

## Solucion

En `ExcludeAdminZiggyRoutes`, incluir las páginas de auth como "necesitan rutas
admin":

- `login`
- `register`
- `password/*`

El frontend público (`/`, catálogo) sigue **sin** exponer rutas admin (test
preexistente §4.1.4 se mantiene).

## Archivos modificados

- `app/Http/Middleware/ExcludeAdminZiggyRoutes.php`
- `tests/Feature/ZiggyAdminRoutesTest.php` (nuevo caso: Ziggy en `/login`)

## Verificacion

- GET `/login` → contiene `admin.dashboard` y `products.index`
- GET `/` → **no** contiene `admin.dashboard` (sigue cerrado)
- Browser: login SPA → `/admin/dashboard` monta con "Productos" y "Stock bajo"
  (antes: `children=0`, texto vacío)
- `artisan test --compact` → **130 passed** (698 assertions)
- `npm run lint` → **0 errors** (330 warnings pre-existentes)

## Commit

`fix(auth): Ziggy admin en /login para dashboard SPA tras login (F4-58)`
