# F4-63 — Contacto: branding de email + validación en español + feedback de envío

## Problemas detectados en QA

1. **Email de contacto con branding de otro proyecto**: `message-received.blade.php` decía "Contacto Red Agua" y "RedAgua" (proyecto anterior del template).
2. **Validación en inglés**: `WebController::store()` sin mensajes custom → `The name field is required.`
3. **Sin feedback visible al enviar**: el formulario de contacto no mostraba toast de éxito/error (solo `recentlySuccessful`, que no era observable).

## Cambios

- `resources/views/emails/message-received.blade.php`: "Red Agua"/"RedAgua" → "Smart House".
- `app/Http/Controllers/WebController.php` (`store()`): mensajes de validación en español (`El nombre es obligatorio.`, `El teléfono es obligatorio.`, `El email es obligatorio.`, `El email no es válido.`); se limpiaron comentarios de reCAPTCHA muertos.
- `resources/js/pages/web/ContactoPage.tsx`: `toast.success('El mensaje fue enviado exitosamente.')` en `onSuccess` + `toast.error('Revisa los campos del formulario e inténtalo de nuevo.')` en `onError` (sonner, igual que Header para carrito).

## Verificación (QA browser, sesión qa-full2/qa-empty-final2)

- Envío válido → toast `El mensaje fue enviado exitosamente.` ✅
- Envío vacío (HTML5 `required` removido para forzar servidor) → alerts `El nombre es obligatorio.` / `El teléfono es obligatorio.` / `El email es obligatorio.` + toast `Revisa los campos del formulario e inténtalo de nuevo.` ✅
- Carrito end-to-end: badge 0→1, toast `El producto se agrego correctamente al carrito.`, offcanvas "Mi carrito" con item + `Finalizar pedido`, checkout con resumen `1 × Bs. 899.00` ✅
- Rutas: `/` 200, `/productos` 200, `/contactanos` 200, `/checkout` 302→`/` (carrito vacío, intencional), `/servicios` 302→`/contactanos` (intencional)
- Falsos positivos descartados en QA: no existe ruta GET `/carrito` (carrito es offcanvas); imágenes 18/18 en disco (blanco = lazy sin scroll)
- `php artisan test --compact` → 130 passed; `npm run lint` → 0 errors
