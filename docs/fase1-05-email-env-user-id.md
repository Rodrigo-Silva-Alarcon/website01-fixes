# Fix 5 — Email de contacto a `.env` + `user_id` real del carrito (Fase 1)

## Problema

1. **Email duro-codeado** en `app/Http/Controllers/WebController.php:106`:
   ```php
   Mail::to('mjuchani@megalink.com')->send(new ContactForm(...));
   ```
   El email del destinatario estaba fijo en el código fuente. No se podía cambiar por entorno (dev/staging/prod) sin editar código, y rompe la práctica de no tener configuración sensible/de despliegue en el repositorio.

2. **`user_id` del carrito forzado a `0`** en `app/Http/Controllers/ShopController.php:47`:
   ```php
   'user_id' => 0,
   ```
   Todos los carritos (también de invitados y de usuarios reales) se guardaban con `user_id = 0`. Al no usar `auth()->id()`:
   - Los carritos autenticados no se asociaban a su usuario real (imposible recuperar carrito por cuenta, historial, etc.).
   - Se perdía la distinción entre invitado (`NULL`) y usuario con id 0 (si existiera).

## Solución

1. **Email configurable por entorno**
   - Nuevo archivo `config/contact.php` con clave `email`:
     ```php
     'email' => env('CONTACT_EMAIL', env('MAIL_FROM_ADDRESS', 'hello@example.com')),
     ```
   - `WebController.php:106` ahora usa:
     ```php
     Mail::to(config('contact.email'))->send(new ContactForm(...));
     ```
   - `.env.example` documenta la nueva variable: `CONTACT_EMAIL="hello@example.com"`.

2. **`user_id` auténtico**
   - `ShopController.php:47` ahora usa:
     ```php
     'user_id' => auth()->id(),
     ```
   - La migración `2025_09_19_170945_create_carts_table.php:16` declara `user_id` como `nullable`, por lo que invitados reciben `NULL` y usuarios autenticados su `id` real.

## Verificación (sin composer local)

- `php -l` OK en `WebController.php`, `ShopController.php`, `config/contact.php`.
- Grep: ya no hay `mjuchani@megalink.com` ni `'user_id' => 0` en `app/`.
- `DatabaseSeeder.php:32,35` aún contiene el email hardcodeado pero es solo de seeders (no crítico; se documenta aquí).

## Archivos

- `config/contact.php` (nuevo)
- `.env.example`
- `app/Http/Controllers/WebController.php`
- `app/Http/Controllers/ShopController.php`

## Fases

Pertenece a **Fase 1 (crítico)**: email → `.env` y `user_id` null → auth (cf. `analisis-mejoras-website01.md` §7).
