# Fix 32 — Code splitting: manualChunks en Vite (Fase 3)

## Problema

`analisis-website01.md` §4.2.4: el bundle inicial incluía vendors pesados (TinyMCE, Recharts, framer-motion) en un solo chunk, inflando el JS de la home y forzando descargas innecesarias en rutas públicas.

`import.meta.glob` en `app.tsx` ya hace lazy por página; faltaba separar libs de vendor.

## Solución

`vite.config.ts` → `build.rollupOptions.output.manualChunks`:

| Chunk | Contenido |
|-------|-----------|
| `vendor` | resto de `node_modules` (react, radix, inertia, etc.) |
| `vendor-tinymce` | `tinymce` / `@tinymce/*` (solo admin texts) |
| `vendor-charts` | `recharts` / `d3-*` (solo dashboard) |
| `vendor-motion` | `framer-motion` / `aos` (solo landing/animaciones) |

Chunks de página siguen viniendo de `import.meta.glob`.

## Archivos modificados

- `vite.config.ts`

## Verificación

- `npm run build` → **BUILD_OK** (~36s); chunks generados: `vendor-tinymce` 14 kB, `vendor-charts` 50 kB, `vendor-motion` 92 kB.
- `npx tsc --noEmit` → 0 errores.
- `artisan test --compact` → 86/86.

## Fases

**Fase 3 (calidad / rendimiento)** — `analisis-website01.md` §4.2.4.
