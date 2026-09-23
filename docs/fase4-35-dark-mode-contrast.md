# Fix — Contraste dark mode: texto e iconos sobre fondo de página (Fase 4)

## Problema

Con `.dark` activo (`--background: oklch(0.145)`, casi negro), varios bloques
sobre el **fondo de página** usaban color fijo `text-[#191c1f]` o strokes SVG
`rgba(25, 28, 31, 1)`, quedando ilegibles:

- Feature strip de la home (`Frame1`): "Entrega más rápida", "Pago Seguro",
  "Soporte 24/7" + iconos stroke negros.
- Sección About (`AboutFeaturesSection`, `AboutHeroSection`): mismos textos e
  iconos.
- `ProductDetailPage`: etiquetas "Marca", descripción y modales sobre fondo
  de página; bordes de colapsables `border-[#191c1f]`.
- `FindProductsPage`: paginación activa con borde `#191c1f`.
- Hero: logo Samsung (`16fe437f…png`) es **negro sobre transparente**; sin
  fondo claro detrás, en dark mode se perdía sobre el fondo negro.

Medido en navegador (dark): `bg oklch(0.145)`, texto corregido
`oklch(0.985)` (blanco).

**No** se tocó texto dentro de tarjetas siempre claras (`#f2f4f5`,
`#e0eef3`, `bg-white`, chips `#f0faff`) — ahí `#191c1f` sigue siendo
correcto en ambos temas (patrón F4-29).

## Solucion

| Archivo | Cambio |
|---|---|
| `imports/Frame1.tsx` | `text-[#191c1f]` → `text-foreground`; strokes `--stroke-0` → `var(--foreground)` |
| `components/AboutFeaturesSection.tsx` | ídem |
| `components/AboutHeroSection.tsx` | `text-[#191c1f]` → `text-foreground` |
| `components/HeroSlideshow.tsx` | `bg-white` en el contenedor del slide (fondo claro para logos negros) |
| `FindProductsPage.tsx` | paginación `text-foreground` + borde `border-border` |
| `ProductDetailPage.tsx` | Marca/descripción/modales → `text-foreground`; bordes → `border-border` |

Orphan imports (`Frame397`, `Ofertas-12-*`) no se modifican: no están en el
árbol de render.

## Archivos modificados

- `resources/js/pages/web/imports/Frame1.tsx`
- `resources/js/pages/web/components/AboutFeaturesSection.tsx`
- `resources/js/pages/web/components/AboutHeroSection.tsx`
- `resources/js/pages/web/components/HeroSlideshow.tsx`
- `resources/js/pages/web/FindProductsPage.tsx`
- `resources/js/pages/web/ProductDetailPage.tsx`

## Verificacion

- Navegador dark: feature strip `color oklch(0.985 0 0)`; hero contenedor
  `rgb(255, 255, 255)`; títulos de sección siguen blancos (F4-29).
- `npx tsc --noEmit` → OK
- `npx eslint` (6 archivos) → 0 errors (12 warnings preexistentes en
  `ProductDetailPage`, no introducidos por este fix)
- `artisan test --compact` → **118/118** (631 assertions)

## Commit

`fix(ui): contraste dark mode texto e iconos home/about (Fase 4)`
