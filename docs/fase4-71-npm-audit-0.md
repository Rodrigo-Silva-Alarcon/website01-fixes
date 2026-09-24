# F4-71 — npm audit: 2 vulnerabilidades restantes resueltas (0 en total)

## Problema

Tras F4-57 (`npm audit fix`) quedaban **2 vulnerabilidades high** declaradas como *no fixables*:

- `axios <=0.32.0` (dentro de `node_modules/@inertiajs/inertia/node_modules/axios` → 0.21.4): CSRF, SSRF, prototype pollution, header injection, DoS…
- `@inertiajs/inertia` dependía de esa versión vulnerable.

## Análisis

- `@inertiajs/inertia@0.11.1` es el paquete **legacy** de Inertia (API `Inertia.get/post` de la v0). El proyecto usa `@inertiajs/react@2.2.x` (standalone).
- **No se importa en ningún archivo** del repo (búsqueda en `resources/`, `tests/`, configs): solo estaba declarado en `package.json`. Dependencia muerta con un árbol de axios 0.21.4 hardcodeado (`axios: ^0.21.1` en sus deps → sin fix posible desde el lado de npm).

## Cambios

- `npm uninstall @inertiajs/inertia` → `package.json` / `package-lock.json` sin el paquete legacy.

## Verificación

- `npm audit` → **found 0 vulnerabilities** (antes: 2 high).
- `npm run build` OK; `php artisan test --compact` → 130 passed; `npm run lint` → 0 errors.
