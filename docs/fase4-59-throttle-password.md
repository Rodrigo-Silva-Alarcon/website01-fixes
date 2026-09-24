# F4-59 — Rate limit password reset + password rule admin

## Ámbito (§1.4, §1.6 parcial — analisis-mejoras)

- `routes/auth.php`: `throttle:5,1` en las 4 rutas de recuperación/reset de contraseña (`password.request`, `password.email`, `password.reset`, `password.store`).
- `app/Http/Controllers/Admin/UserController.php` (`updatePassword`): regla `Password::min(8)->letters()->numbers()` alineada con `Password::defaults` del `AppServiceProvider`.
- El formulario de contacto (`POST /enviar`) ya tenía `throttle:5,1` (verificado).

## Verificación

- `php artisan test --compact` → 130 passed (698 assertions) con herd PHP 8.4.
- `npm run lint` → 0 errors (330 warnings pre-existentes).

## Fuera de alcance

- §1.5 reCAPTCHA: requiere credenciales del cliente.
