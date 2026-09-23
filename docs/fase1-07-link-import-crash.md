# Fix 7 — ReferenceError: Link is not defined en home (Fase 1)

## Problema

Al levantar el proyecto (`npm run dev` + `php artisan serve`), la home respondía HTTP 200 pero React **no montaba** la página: el usuario veía el shell vacío. La causa era un `ReferenceError: Link is not defined` en tiempo de render:

- `resources/js/pages/web/components/Ofertas.tsx:114` — usa `<Link>` en `Cards`
- `resources/js/pages/web/components/Banner.tsx` — varios `<Link>` de productos/categoría
- `resources/js/pages/web/imports/BlockCategory.tsx` — `<Link>` en bloques de categoría

Los tres importaban solo `{ router, usePage }` de `@inertiajs/react`, no `Link`. El error no era visible en la consola del navegador hasta instrumentar `window.onerror` / re-importar el módulo (sin error boundary, el crash rompe el árbol completo).

## Solución

Añadir `Link` al named import de `@inertiajs/react` en los tres archivos:

```tsx
import { Link, router, usePage } from "@inertiajs/react";
```

Mismo patrón que ya usaban `CategoriasMenu.tsx`, `Header.tsx` y el resto del storefront.

## Archivos modificados

- `resources/js/pages/web/components/Ofertas.tsx`
- `resources/js/pages/web/components/Banner.tsx`
- `resources/js/pages/web/imports/BlockCategory.tsx`

## Verificación

- `npm run build` / Vite HMR: sin errores de compilación en los tres módulos.
- Home en http://127.0.0.1:8000: header, carrusel de populares (4 productos con precio), sección de categorías y marcas renderizan; props del servidor (`populares=4`, `categorias=3`, `destacados=4`, `marcas=3`) presentes en `data-page`.
- Screenshot de home con datos demo tras el fix.

## Fases

**Fase 1 (crítico)** — la home no renderizaba; rompía toda la storefront (bloqueante para el resto de mejoras visuales/funcionales).
