# F4-66 — Home: sección Destacados como carrusel (sin desborde)

## Problema

Reporte del usuario: la sección de cards destacados de la home "se ve entrecortada y no tiene animación de avance para mostrar la siguiente card".

Diagnóstico QA: `Destacados()` pintaba 8 productos `featured` en un `flex lg:flex-row` con cards `shrink-0`, sin carrusel — a cualquier viewport menor a ~2528px las cards quedaban cortadas (scrollWidth 1440/2528 vs viewport) y no había avance.

## Cambios

- `Banner.tsx` — `Destacados()` reescrito como carrusel embla (patrón de `HeroSlideshow.tsx`):
  - `Carousel` con `opts={{ align: "start", loop: hasMultiple }}` y plugin `Autoplay({ delay: 4000, stopOnInteraction: false })` vía `useRef` (mismo patrón que el hero, delay 4s).
  - Slides: `pl-[16px] basis-full sm:basis-1/2 xl:basis-1/3` (1/2/3 cards visibles según breakpoint) + `CarouselPrevious`/`CarouselNext` con `bg-white/80`.
  - Cards con `h-full` para igualar altura por fila.
- `ui/carousel.tsx` — viewport de `CarouselContent`: `overflow-hidden` → `overflow-hidden w-0 min-w-full`. El `min-content` del inner flex (`flex -ml-3`) se propagaba al contenedor raíz (secciones `max-w-[1440px]` quedaban en 1440 aunque el viewport fuera menor, p. ej. 749px). `w-0 min-w-full` fija el viewport a 100% del padre y corta esa propagación. Afecta a todos los carruseles del storefront (los de admin usan `components/ui/carousel.tsx`, sin tocar).

## Verificación (QA browser)

- **Sin scroll horizontal**: viewport 749 → ancho documento = 749 (antes 1440); viewport 1920 → `htmlScrollW = htmlClientW = 1905`, `scrollTo(9999)` queda en `scrollX = 0`.
- **Autoplay avanza**: transform del inner del carrusel destacados en 1920 → `0` → `-577/-581px` → `-1364` → `-2087` (4s de intervalo).
- `elementFromPoint` en el borde inferior del viewport: sin scrollbar de ventana (la "barra" observada en capturas eran los tops de las cards de "Productos populares" asomando al fondo, comportamiento normal).
- 0 console errors; `php artisan test --compact` → 130 passed; `npm run lint` → 0 errors (330 warnings pre-existentes); `npm run build` OK.
