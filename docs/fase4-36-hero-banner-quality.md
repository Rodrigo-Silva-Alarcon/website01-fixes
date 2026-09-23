# Fix — Calidad/crop del banner hero (Fase 4)

## Problema

El banner de cocina (`e002f7b5-…png`, 1600×890 ≈ 16:9) se servía dentro de
un contenedor con aspect ratios mucho más anchos (`9/4` → `26/9` → `32/9`),
por lo que `object-cover` recortaba ~25% de la altura y ampliaba el asset
(soft blurry al upscale en pantallas anchas).

No hay versión de mayor resolución: la SHA del asset es idéntica a
producción (no existe fuente más grande).

## Solucion

CSS en `HeroSlideshow.tsx`:

| Antes | Despues |
|---|---|
| `aspect-[9/4] md:aspect-[26/9] xl:aspect-[32/9]` | `aspect-[16/9] md:aspect-[2/1] xl:aspect-[21/9] max-h-[560px]` |
| `object-cover` | `object-cover object-[50%_45%]` |

- Aspect ratios más cercanos a 16:9 → menos recorte y menos upscale.
- `max-h-[560px]` limita la altura en pantallas muy anchas.
- `object-[50%_45%]` mantiene el sujeto del banner centrado hacia arriba.

## Archivos modificados

- `resources/js/pages/web/components/HeroSlideshow.tsx`

## Verificacion

- `npx tsc --noEmit` → OK
- `npx eslint resources/js/pages/web/components/HeroSlideshow.tsx --max-warnings 0` → OK

## Commit

`fix(ui): reduce crop y upscale del banner hero (Fase 4)`
