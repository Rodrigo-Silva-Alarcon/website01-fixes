---
name: rendimiento-web
description: Reglas de rendimiento y accesibilidad de la tienda SmartHouse (Laravel + Inertia + React + SSR). Usar SIEMPRE antes de crear o modificar páginas, componentes, estilos, imágenes, fuentes, props de Inertia, vite.config.ts o app.blade.php, tanto de la tienda (pages/web) como del panel admin, para no bajar la nota de PageSpeed móvil.
---

# Rendimiento de la tienda SmartHouse

Objetivo: mantener PageSpeed móvil ≥ 87 en rendimiento y 100 en accesibilidad.
En Lighthouse móvil todo depende de **cuánto pesa el HTML** (nada empieza a descargarse hasta
que llega entero) y de **cuánto CSS bloquea el pintado**. Cada regla de abajo protege una de esas dos cosas.

## 1. CSS: tienda ligera, panel completo

- `resources/css/app.css` = solo la tienda. Usa `@import 'tailwindcss' source(none)` y una lista
  explícita de `@source`. Se carga en todas las páginas y bloquea el pintado.
- `resources/css/admin.css` = todo el proyecto. Lo cargan solo las páginas que no son `web/*`
  (`app.blade.php` lo enlaza y `app.tsx` lo importa en `resolve` al navegar sin recargar).
- `resources/css/shared.css` = tema, variantes, base y estilos propios comunes a las dos.
- **Si creas un archivo que usa la tienda fuera de `resources/js/pages/web`, `hooks` o `lib`**
  (por ejemplo un componente nuevo en `resources/js/components/`), añádelo a los `@source` de `app.css`.
  Si no, sus clases de Tailwind no existirán en la tienda (se verá sin estilos).
- No importes en la tienda componentes de `resources/js/components/ui` (shadcn del panel) sin añadirlos a `@source`.
- Nada del panel en `app.css`. El panel puede crecer libremente: no afecta a la tienda.
- `pages/web/styles/globals.css` (lo importa el Layout de la tienda) nunca debe llegar al panel.

## 2. JavaScript: pocos chunks, sin ciclos

- `vite.config.ts` agrupa en `core` (lo que carga app.tsx), `shared` (tienda + panel) y `web`
  (layout de la tienda + inicio). React, Inertia y sus dependencias quedan en `vendor-react`.
- No cambies `manualChunks` sin verificar después del `npm run build`, con `public/build/manifest.json`:
  1. `resources/js/app.tsx` no importa `_web-*` (si no, el CSS de la tienda llega al panel).
  2. Ninguna página fuera de `pages/web/` importa `_web-*`.
  3. No hay ciclos entre chunks (un chunk que se importa a sí mismo vía otros): rompen con
     "Cannot access 'React' before initialization".
- El build SSR no usa `manualChunks` (a propósito).
- Librerías pesadas (mapas, gráficos, editores) solo en la página que las usa, nunca en Layout/Header/Footer.

## 3. HTML inicial pequeño (SSR)

- Lo que no se ve al cargar (paneles cerrados, modales, copias para animaciones) se monta con
  `useIdleMount()` (`resources/js/hooks/use-idle-mount.ts`): `{(ready || open) && <Panel/>}`.
  Así ya están el menú móvil, el carrito lateral y la 2ª copia del mosaico de categorías.
- Props de Inertia mínimas: los productos de tarjetas pasan por `forCards()` en
  `app/Services/WebContentService.php` (oculta relaciones completas y timestamps). Usa
  `category_slug`, `category_label`, `brand_label`… nunca envíes `category`/`brand` completos a listas.
- Datos que no hacen falta para pintar → `Inertia::defer()` (como `cartSuggestions`).
- No añadas props compartidas grandes en `HandleInertiaRequests::share()`: van en el HTML de **cada** página.
- `@inertiaHead` va antes de `@routes` en `app.blade.php` (el preload de la imagen LCP debe estar en los primeros KB).
- `config/ziggy.php` tiene `skip-route-function` = true: usa siempre `import { route } from 'ziggy-js'`, no un `route()` global.

## 4. Imágenes

- La primera imagen visible (banner del hero) es el LCP: `loading="eager"`, `fetchPriority="high"`,
  preload en `<Head>` (ya lo hace `HeroCarousel.tsx`). Ninguna otra imagen con eager/high.
- Banners: variante WebP de 800 px en `public/data/banners/md/` + `image_srcset`. Se generan al
  subir y con `php artisan images:webp`. Las imágenes de `public/data` se commitean.
- El resto de imágenes: `ResponsiveImg` (WebP + miniatura 480 w + `sizes` correcto), `loading="lazy"`.
- Imágenes estáticas nuevas: en WebP, al tamaño real en que se muestran (×2 como máximo).

## 5. Fuentes

- Una sola petición a Google Fonts con `DM Sans` e `Instrument Sans` variables (`wght@400..700`),
  cargada sin bloquear (`media="print" onload`). No añadas familias, pesos sueltos, cursivas ni otros proveedores.

## 6. Accesibilidad (mantener 100)

- Texto naranja sobre blanco: `#c2410c` (no `#fa8232`). Sobre fondo `#fa8232`, texto oscuro `#191c1f`.
  Sobre azul `#155eef`, texto blanco.
- Elementos ocultos con enlaces/botones dentro: `inert`, no solo `aria-hidden`.
- Botones táctiles de al menos 24×24 px (los puntos de carrusel: botón de 24 px con el punto dentro).
- Enlaces con el mismo texto y distinto destino ("Ver más"): añade `<span className="sr-only">` con el contexto.
- Botones solo con icono: `aria-label`.

## Verificación antes de dar por terminado un cambio

1. `php artisan test`, `npm run types` (hay 19 errores antiguos del panel; no deben aumentar).
2. `npm run build:ssr` sin errores y revisar el manifest (sección 2).
3. Si tocaste la tienda: medir el HTML de `/` con SSR (gzip ~27 KB, `app.css` ~20 KB gzip) y
   comprobar en móvil que no faltan clases (comparar clases del DOM contra `app.css`).
4. Tras desplegar: PageSpeed móvil de https://website01-a3tc.onrender.com/ y comparar con la última nota.
