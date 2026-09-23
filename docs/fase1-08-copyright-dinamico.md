# Fix 8 — Copyright con año dinámico (Fase 1)

## Problema

El pie de página mostraba el año hardcodeado **`© Smart House, 2025`** en dos variantes de footer:

- `resources/js/pages/web/components/Footer.tsx:102` (usado por Layout, Cuenta, FindProducts)
- `resources/js/pages/web/imports/Footer-10-1856.tsx:88` (export Footer legacy)

Al pasar el año, el copyright quedaba desactualizado (`analisis-website01.md` / `analisis-mejoras-website01.md` — copyright).

## Solución

Reemplazar el literal por `{new Date().getFullYear()}` en ambos archivos:

```tsx
© Smart House, {new Date().getFullYear()}. Todos los derechos reservados.
```

No se inventó contenido de cliente: solo se hizo dinámico el año ya existente. Los placeholders de WhatsApp/correo/mapas/facebook se dejan pendientes de datos reales del cliente.

## Archivos modificados

- `resources/js/pages/web/components/Footer.tsx`
- `resources/js/pages/web/imports/Footer-10-1856.tsx`

## Verificación

- Grep: sin `Smart House, 2025` hardcodeado en `resources/js`.
- Home renderizada: copyright en footer muestra el año actual.

## Fases

**Fase 1 (crítico / legal)** — copyright fijo en el pasado.
