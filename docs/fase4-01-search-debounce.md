# Fix — Búsqueda con debounce 300ms (Fase 4)

## Problema

`analisis-website01.md` §4.4.5: la búsqueda del header solo se ejecuta al pulsar Enter/submit. No hay búsqueda incremental mientras se escribe.

## Solución

1. **Nuevo hook `resources/js/hooks/use-debounced-value.ts`** — `useDebouncedValue(value, delayMs)` devuelve el valor retrasado (default 300 ms) con cleanup del timer.
2. **`Header.tsx` desktop** — al cambiar `debouncedFind`, navega a `products` con `find`, `page: 1` y preserva filtros `cs`/`ms` activos. Salta si `debouncedFind` ya coincide con el `find` actual de la URL.
3. **`Header.tsx` mobile** — mismo patrón con solo `find`.
4. El `submit` del form se mantiene para búsqueda inmediata al pulsar Enter.

## Archivos modificados

- `resources/js/hooks/use-debounced-value.ts` (nuevo)
- `resources/js/pages/web/components/Header.tsx`

## Verificación

- `npx eslint` sobre los dos archivos → **0 errores** (solo warnings preexistentes).
- `npx tsc --noEmit` → **TSC_OK**.

## Fases

**Fase 4 (UX)** — `analisis-website01.md` §4.4.5.
