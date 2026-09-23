# Fix — Botón eliminar del carrito visible y accesible (Fase 4)

## Problema

`analisis-website01.md` §4.4.6: la función `remove` existía en backend pero la UI no mostraba claramente el control de borrado (icono suelto fuera del botón, sin feedback al eliminar).

## Solución

1. **`ItemDelete` reescrito** — icono + label dentro de un único `<button>` (target clicable completo).
2. **`aria-label`** — `Eliminar {nombre} del carrito` para lectores de pantalla.
3. **Feedback** — `toast.success` en `onSuccess` y `toast.error` en `onError` vía `router.post('removeshop')`.
4. **Estados** — `disabled` + `pending` durante la request; `hover:text-[#d9534f]` y `transition-colors` para descubribilidad visual.

## Archivos modificados

- `resources/js/pages/web/imports/Carrito.tsx`

## Verificación

- `npx eslint resources/js/pages/web/imports/Carrito.tsx` → **0 errores**.
- `npx tsc --noEmit` → **TSC_OK**.

## Fases

**Fase 4 (UX)** — `analisis-website01.md` §4.4.6.
