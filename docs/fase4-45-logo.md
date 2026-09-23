# Fix — Logo nuevo Smart House (Fase 4)

## Problema

`AppLogoIcon` usaba un SVG genérico (silueta de casa + texto Arial
"Smart House" en una sola línea), sin identidad de marca y distinto del
logo original de la empresa (casa + red inteligente).

## Solucion

Rediseño del componente central `app-logo-icon.tsx` (lo usan header,
footer, sidebar/header admin, layouts auth y dashboard):

- **Marca color**: casa naranja `#fa8232`, nodos azules `#155eef`
  conectados (triángulo invertido) y puerta oscura.
- **Wordmark**: "SMART" en `currentColor` + "HOUSE" en naranja,
  legible en header (fondo claro) y footer (fondo oscuro).
- **Variante `icon` (monocromo)**: misma silueta con recortes de nodos
  (`fill-rule="evenodd"`) y `currentColor` para badges admin/auth.

Actualizados también:

- `public/favicon.svg` — ahora la marca naranja (antes genérico verde).
- `public/logo.svg` — wordmark estático alineado al nuevo diseño.
- `app-logo.tsx` — badge admin `bg-[#191c1f]` (antes `sidebar-primary`)
  para que la marca monocroma sea visible.

## Archivos modificados

- `resources/js/components/app-logo-icon.tsx`
- `resources/js/components/app-logo.tsx`
- `public/favicon.svg`
- `public/logo.svg`

## Verificacion

- `npm run lint` → 0 errors (331 warnings pre-existentes)
- `artisan test --compact` → 118 passed (631 assertions)
- Home `http://127.0.0.1:8000/` → header muestra SVG naranja +
  wordmark SMART/HOUSE (captura)

## Commit

`feat(ui): logo nuevo Smart House (F4-45)`
