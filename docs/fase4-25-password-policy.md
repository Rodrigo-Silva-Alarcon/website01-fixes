# Fase 4-25 — Politica de contrasenas (5.1.6)

## Problema

`analisis-website01.md` 5.1.6: `SaveUserRequest` solo exigia `min:8`.
`Password::defaults()` (registro y reset) usaba el minimo del framework sin
complejidad.

## Cambios

| Archivo | Cambio |
|---|---|
| `app/Providers/AppServiceProvider.php` | `Password::defaults`: min 8 + letras + numeros |
| `app/Http/Requests/SaveUserRequest.php` | `Password::min(8)->letters()->numbers()` + mensajes ES |
| `tests/Feature/Auth/RegistrationTest.php` | Password valida `Password123`; test rechaza password sin numero |
| `tests/Feature/Auth/PasswordResetTest.php` | Reset con `Password123` |
| `tests/Feature/Settings/PasswordUpdateTest.php` | Update con `Password123` |

## Comportamiento

- Registro, reset y creacion de usuario admin exigen >=8, al menos 1 letra y 1 digito.
- Login / passwords existentes no se migran (solo validacion de nuevas).

## Verificacion

- `artisan test --compact` → **109 passed (619 assertions)**

## Commit

`fix(auth): politica de contrasena con letras y numeros (Fase 4)`
