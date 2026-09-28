# F4-84 — Categorías: imágenes de las tarjetas teñidas de naranja

## Problema

Las imágenes de la sección **Categorías** del home se mostraban con un
**caste naranja/durazno** en lugar de sus colores reales (la lavadora blanca
parecía crema).

## Causa

Las tarjetas usan `mix-blend-multiply` en la imagen (truco heredado de
Figma: funde el fondo blanco de las fotos de estudio con la tarjeta). El
retematizado F4-80 cambió el fondo de la tarjeta de `#e0eef3` (azul claro,
tinte casi imperceptible) a `#ffedd5` (crema saturado), y el multiply
multiplica cada píxel de la foto por ese crema → **todas las fotos cambiaron
de color**.

Además las4 imágenes de categorías son mixtas: `Cocina` y `Equipos de
sonido` son PNG transparentes, `Electrodomésticos` y `Consolas` tienen
fondo blanco opaco — así que quitar el multiply a secas dejaría dos
tarjetas con un recuadro blanco visible.

El resto del sitio es inmune: todas las demás tarjetas con multiply usan
`#f2f4f5` o `#fff7ed` (casi blancos → tinte invisible), solo Categorías
tiene fondo saturado.

## Fix (`resources/js/pages/web/components/Categorias.tsx`)

- Se eliminó `mix-blend-multiply` del `<ResponsiveImg>` (imágenes siempre
  en color real).
- El contenedor de la imagen ahora es un **tile blanco redondeado**
  (`bg-white rounded-[12px]`): las fotos con fondo blanco opaco quedan
  invisibles sobre el tile y las transparentes muestran el producto sobre
  blanco — uniforme en las4 tarjetas, sin tintes, conservando la tarjeta
  crema de la paleta.

## Verificación

- Recaptura del home: lavadora/blanco y horno en color real, las4 tarjetas
  con tile blanco uniforme (`doc-shots/ut-categorias-fix.png`).
- Chequeo computado: `mix-blend-mode: normal` en las4 imágenes; el contenedor
  `rgb(255, 255, 255)` con radio12px.
- `npm run build` OK; `npm run lint` → **0 errors / 215 warnings** (baseline);
  0 console errors / 0 HTTP500 en la carga del home.

## Alternativa no aplicada

Procesar las2 imágenes con fondo blanco a transparentes (flood-fill) para
que las fotos floten sobre la tarjeta crema sin tile, como en el diseño
original. Queda como opción si se prefiere ese aspecto.
