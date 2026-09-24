# Fix — Registro redirige a home sin permiso de dashboard (Fase 4)

## Problema

**§5.1.9:** tras registrarse, el usuario era redirigido siempre a
`/admin/dashboard` aunque no tuviera el permiso `access_dashboard`
(el middleware F4-34 devolvía 403 o una experiencia confusa).

## Solucion

En `RegisteredUserController::store`, después del login:

- Si `$user->hasPermission('access_dashboard')` → redirect a `admin.dashboard`
- Si no → redirect a `home`

Se usa el método RBAC propio `User::hasPermission()` (no el `can()` de
Laravel, que no está conectado a este modelo).

## Archivos modificados

- `app/Http/Controllers/Auth/RegisteredUserController.php`
- `tests/Feature/Auth/RegistrationTest.php` (assert → `home`)

## Verificacion

- `artisan test --compact` → **125 passed** (679 assertions)
  (`RegistrationTest` + `AuthenticationTest` = 8 passed)
- lint → **0 errors** (330 warnings pre-existentes)

## Commit

`fix(auth): redirect registro a home sin permiso dashboard (F4-51)`
