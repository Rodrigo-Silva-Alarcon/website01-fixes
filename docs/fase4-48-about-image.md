# Fix — Imagen "Sobre nosotros" (Fase 4)

## Problema

- El hero de `/nosotros` (`AboutHeroSection`) importaba
  `0910ac1d…png`: archivo con cabecera JPEG mal etiquetado; Vite dejaba
  el request **pending** en el navegador y `naturalWidth=0` (alt
  "Smart House Bolivia" visible).

## Solucion

1. Imagen Unsplash nueva (1200×801 JPEG) en
   `public/images/about-hero-smarthouse.jpg` (sirve Laravel :8000,
   evita el bug de Vite en assets de `resources/`).
2. `AboutHeroSection.tsx`: `src` apunta a
   `/images/about-hero-smarthouse.jpg` (string, no import de bundle).

## Archivos modificados

- `resources/js/pages/web/components/AboutHeroSection.tsx`
- `public/images/about-hero-smarthouse.jpg` (nuevo)

## Verificacion

- `/nosotros`: img `complete=true`, `1200x801` (antes 0×0)
- `npm run lint` → 0 errors (331 warnings pre-existentes)
- `artisan test --compact` → 118 passed (631 assertions)

## Commit

`fix(ui): imagen sobre nosotros (F4-48)`
