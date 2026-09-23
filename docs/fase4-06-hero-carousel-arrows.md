# Fase 4-06 — Hero carousel: flechas ocultas con 1 solo slide (§4.7.16)

## Problema

El hero de banners mostraba botones Previous/Next deshabilitados cuando solo había
1 banner activo (ruido visual y a11y confusa).

## Cambios

| Archivo | Cambio |
|---|---|
| `resources/js/pages/web/components/HeroSlideshow.tsx` | `hasMultiple = banners.length > 1`; solo renderiza `CarouselPrevious`/`CarouselNext` si hay >1; `loop` y autoplay solo cuando hay >1; se eliminó el `index` no usado del `map` |

## Comportamiento

- 0 o 1 banner → sin flechas, sin loop, sin autoplay (imagen estática).
- ≥2 banners → flechas, loop y autoplay como antes.

## Verificación

- `npx eslint resources/js/pages/web/components/HeroSlideshow.tsx` → 0 errores
- `npx tsc --noEmit` → OK

## Commit

`fix(hero): ocultar flechas del carousel con un solo banner (Fase 4)`
