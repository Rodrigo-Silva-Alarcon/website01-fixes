# Fase 4-07 — Rutas admin fuera del payload Ziggy público (§4.1.4)

## Problema

`@routes` en `app.blade.php` exportaba **todas** las rutas con nombre (incluidas
`admin.*`, CRUD de categorías/productos/banners/etc.) al JS de cualquier visitante
del frontend público → reconocimiento de superficie de ataque.

## Cambios

| Archivo | Cambio |
|---|---|
| `app/Http/Middleware/ExcludeAdminZiggyRoutes.php` | Nuevo middleware: en requests que **no** son `/admin/*`, `/settings/*` ni `/user/*`, configura `ziggy.except` con los nombres admin y limpia la caché estática de Ziggy (`Ziggy::clearRoutes()`) para que el filtro no contamine requests siguientes |
| `bootstrap/app.php` | Registra el middleware el primero de la pila `web` |
| `tests/Feature/ZiggyAdminRoutesTest.php` | Home pública sin `admin.dashboard` / `admin.users.index` / `products.index` / `admin/products`; `/admin/dashboard` autenticado **sí** los expone |

## Por qué middleware y no AppServiceProvider::boot

En tests (y al arrancar la app), `boot()` corre **antes** de que exista el request
HTTP real → `request()->is('admin/*')` siempre era falso y filtraba también el
panel. El middleware se ejecuta con el path correcto.

## Rutas excluidas en frontend público

`admin.*`, `categories.*`, `subcategories.*`, `products.*` (CRUD, no `products`
ni `products_post` de la web), `banners.*`, `brands.*`, `images.*`,
`inventories.*`, `profile.*`, `password.edit|update|confirm*`, `appearance`.

Se mantienen en `/admin/*`, `/settings/*` y `/user/*`.

## Verificación

- `artisan test --compact` → **94 passed (429 assertions)**
- Home: payload Ziggy solo con rutas públicas + auth

## Commit

`fix(security): excluir rutas admin del payload Ziggy público (Fase 4)`
