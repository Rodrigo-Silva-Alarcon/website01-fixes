# Fix 6 — Logo "Lg" → wordmark "Smart House" (Fase 1)

## Problema

`resources/js/components/app-logo-icon.tsx` renderizaba texto plano **`"Lg"`** (placeholder de Laravel/Uiawesome) en un SVG:

```tsx
<text ...>Lg</text>
```

Ese componente se usaba en **Header, Footer, dashboard admin, sidebar y layouts de auth**, por lo que el sitio y el panel mostraban un logo roto/aparentemente en mantenimiento (`analisis-website01.md` §4.7.1, `analisis-mejoras-website01.md` §4.4).

Nota: `public/logo.svg` en el repo es el logo por defecto de **Laravel** (`#FF2D20`), no la marca del cliente; no se usó.

## Solución

Se reescribió `app-logo-icon.tsx` con dos variantes:

- **`wordmark`** (default): icono de casa + texto **"Smart House"** (`viewBox="0 0 300 48"`, `fill="currentColor"`, `aria-label="Smart House"`). Se usa en Header (desktop/móvil), Footer, dashboard y sidebar expandido.
- **`icon`**: solo el glyph de casa (`viewBox="0 0 48 48"`). Se usa en contenedores cuadrados/pequeños: `AppLogo`, `app-header` móvil, layouts de auth.

`currentColor` mantiene el comportamiento previo: oscuro en header (`#191c1f`), blanco en footer, adaptación a dark mode.

## Archivos modificados

- `resources/js/components/app-logo-icon.tsx` (reescrito)
- `resources/js/components/app-logo.tsx` → `variant="icon"`
- `resources/js/components/app-header.tsx` → `variant="icon"` (nav móvil)
- `resources/js/layouts/auth/auth-card-layout.tsx` → `variant="icon"`
- `resources/js/layouts/auth/auth-simple-layout.tsx` → `variant="icon"`
- `resources/js/layouts/auth/auth-split-layout.tsx` → `variant="icon"` (lado oscuro) + `w-auto` en el wordmark
- `docs/logo-preview.html` / `docs/logo-preview.png` — preview de evidencia

## Verificación

- Grep: sin coincidencias de `aria-label="Lg"`, `>Lg<` ni el `fontSize="42"` original en `resources/js`.
- Screenshot del preview (`docs/logo-preview.png`): wordmark legible en header desktop/móvil, footer blanco sobre fondo oscuro, dashboard e icono 20×20 en sidebar.

## Fases

**Fase 1 (crítico)** — logo visual / primera impresión.
