# Fix — Banner hero + logo Samsung pixelado (Fase 4)

## Problema

1. El banner de cocina (`e002f7b5-…png`, 1600×890) se reemplazó en BD local por
   `ab94c496-8788-4d2b-a6f5-51396168aed1.jpg` (1024×569 ≈ 16:9) a petición.
2. El banner de marca Samsung (`16fe437f-…png`, 1000×667) se veía pixelado:
   `object-cover` + contenedor ancho (`21/9`) forzaba upscale ~1.9× del asset.

## Solucion

1. **BD local**: `banners.id = 1` → `image = ab94c496-….jpg`
   (`App\Models\Banner::where('id',1)->update([...])` vía tinker).
   La BD no viaja en git (patrón F4-30/32); el asset JPG sí se commitea.
2. **CSS en `HeroSlideshow.tsx`**: `object-cover` → `object-contain`.

   Con `object-contain`, el Samsung 1000×667 se limita por alto
   (`max-h-[560px]`) y se dibuja ≈840×560 → por debajo de su resolución
   nativa, sin upscale ni pixelado. Fondo `bg-white` ya estaba (F4-35).

## Archivos modificados

- `resources/js/pages/web/components/HeroSlideshow.tsx`
- `public/data/banners/ab94c496-8788-4d2b-a6f5-51396168aed1.jpg` (nuevo)
- `public/data/banners/e002f7b5-fb3f-4dc0-992d-92977e71623c.png` (eliminado, huérfano)

## Verificacion

- `npx tsc --noEmit` → OK
- `npx eslint …/HeroSlideshow.tsx --max-warnings 0` → OK
- Screenshot navegador: banner Samsung nítido, centrado, sin upscale

## Commit

`fix(ui): banner hero object-contain y asset nuevo (Fase 4)`
