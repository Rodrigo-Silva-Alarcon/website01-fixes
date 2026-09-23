# Fix 13 — Lorem/Yorem Ipsum en página Nosotros (Fase 1)

## Problema

`/Nosotros` mostraba texto placeholder **"Yorem ipsum dolor sit amet..."** en:

- `AboutHeroSection.tsx` — párrafo "Sobre Smart House Bolivia"
- `AboutFeaturesSection.tsx` — bloques **Misión** y **Visión**
- `imports/SectionHero.tsx`, `imports/Ofertas-12-3085.tsx`, `imports/Ofertas-12-2956.tsx` — variantes de diseño no montadas pero con el mismo placeholder

 hallazgo **CRÍTICO** `4.7.12` del análisis: una página Nosotros con lorem destruye la credibilidad.

## Solución

Reemplazar por copy en español coherente con la marca Smart House Bolivia (electrodomésticos, muebles, tecnología):

- **Hero:** descripción de la empresa, catálogo y cobertura nacional.
- **Misión:** oferta de calidad, atención, precios justos y entrega confiable.
- **Visión:** ser tienda de referencia en Bolivia por catálogo, innovación y satisfacción.

El texto es copy de trabajo acorde al giro del negocio; el cliente puede ajustarlo desde CMS o PR sin tocar layout.

## Archivos modificados

- `resources/js/pages/web/components/AboutHeroSection.tsx`
- `resources/js/pages/web/components/AboutFeaturesSection.tsx`
- `resources/js/pages/web/imports/SectionHero.tsx`
- `resources/js/pages/web/imports/Ofertas-12-3085.tsx`
- `resources/js/pages/web/imports/Ofertas-12-2956.tsx`

## Verificación

- Grep: sin `Yorem` / `Lorem ipsum` en `resources/js`.
- Navegador en `http://127.0.0.1:8000/Nosotros`: hero, Misión y Visión muestran el copy real.

## Fases

**Fase 1 (crítico / contenido)** — `analisis-website01.md` §4.7.12.
