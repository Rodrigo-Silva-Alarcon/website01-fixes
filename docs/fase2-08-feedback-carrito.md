# Fix 24 — Feedback de carrito: toast estable + badge de cantidad (Fase 2)

## Problema

§4.4.1: al agregar producto, el toast de Sonner se disparaba **durante el render** (`if (status) toast.success(status)` en el cuerpo del componente), pudiendo repetir toasts en cada re-render; y el botón Carrito no mostraba cuántos artículos hay. `analisis-website01.md` §4.4.1 / §7 — “Feedback carrito toast”.

## Solución

1. **Toast en `useEffect`** (`Header.tsx`): se dispara una sola vez cuando `flash.status` cambia, no en cada render.
2. **Badge de cantidad**: contador naranja (`#fa8232`) sobre el ícono Carrito (desktop) con `cartCount = sum(item.amount)`, incluye `aria-label`. Se oculta si `cartCount === 0`.
3. **Tipos** (`models.ts`): `Cart.cartItems?` opcional además de `cart_items`, para soportar ambas claves de serialización Eloquent.

La actualización del badge es reactiva: el `cart` llega en las props compartidas de Inertia tras cada `addshop`/`updateshop`/`removeshop`, por lo que el contador se refresca al terminar la visita.

## Archivos modificados

- `resources/js/pages/web/components/Header.tsx`
- `resources/js/types/models.ts`

## Verificación

- `npx tsc --noEmit` → 0 errores.
- ESLint en los 2 archivos → 0 errores (warnings preexistentes).

## Fases

**Fase 2 (UX / feedback carrito)** — `analisis-website01.md` §4.4.1 y §7.
