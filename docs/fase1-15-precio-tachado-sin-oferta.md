# Fix 15 — Precios siempre tachados en "Productos populares" (Fase 1)

## Problema

En el carrusel del home, **todos** los precios se mostraban con tachado (precio anterior) aunque no hubiera oferta activa. En la captura: `Bo 3299.00` tachado sin precio de oferta al lado.

Causa en `Ofertas.tsx` → componente local `Precio`: el párrafo con `line-through` **se renderizaba siempre**; `mostrarOferta` solo controlaba si se añadía un segundo precio. Cuando `ini`/`fin`/`offer_amount` eran `null` (sin oferta), quedaba el precio base tachado y solo.

`Price.tsx` (usado en categorías / detalle) ya tenía la lógica correcta: tachado + oferta solo si `mostrarOferta`; si no, precio base sin decoración.

## Solución

Alinear `Precio` de `Ofertas.tsx` con `Price.tsx`:

- **Con oferta activa** (`ini`/`fin` en rango): precio base tachado naranja + precio de oferta.
- **Sin oferta**: un solo párrafo, precio base, **sin** `line-through`.

## Archivos modificados

- `resources/js/pages/web/components/Ofertas.tsx`

## Verificación

- En el home, 4 cards de "Productos populares": `getComputedStyle(p).textDecorationLine` → **no** `line-through` en los precios (`Bo 3299.00`, `Bo 2499.00`, etc.).
- Captura: precios en negro normal, sin tachado.
- `npx tsc --noEmit` sin errores.

## Fases

**Fase 1 (crítico / precio engañoso)** — un precio tachado sin oferta confunde al usuario y daña la confianza en la tienda.
