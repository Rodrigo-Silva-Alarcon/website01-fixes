# Fix — Precio catálogo vs carrito (Fase 4)

## Problema

**§5.3.6:** la lógica de oferta (ventana de fechas + `offer_amount`) solo
se aplicaba de forma robusta en el SQL de `ShopController::add`. Los
listados del catálogo (`Price.tsx`, `Ofertas.tsx`, `product-enquiry.ts`)
recalculaban por su cuenta y divergían cuando `offer_amount` era `NULL`
(el carrito cobraba `amount`, el catálogo mostraba precio vacío/oculto).

## Solucion

- `productPrice()` en `product-enquiry.ts` replica el `COALESCE` del
  SQL: si la ventana de oferta está activa pero `offer_amount` no es un
  número positivo, usa `amount`.
- Nueva helper `isOnOffer()` con la misma condición.
- `Price.tsx` y `Ofertas.tsx` usan `isOnOffer()` en lugar de duplicar
  la lógica de fechas.

## Archivos modificados

- `resources/js/lib/product-enquiry.ts`
- `resources/js/pages/web/imports/Price.tsx`
- `resources/js/pages/web/components/Ofertas.tsx`
- `tests/frontend/product-enquiry.test.mjs` (fallback `offer_amount: null` → `amount`)

## Verificacion

- `node --test tests/frontend/product-enquiry.test.mjs` → **3 passed**
- lint → **0 errors** (330 warnings pre-existentes)
- `artisan test --compact` → **128 passed** (686 assertions)

## Commit

`fix(catalog): unificar precio de oferta con carrito (F4-54)`
