# Fix 9 — Rate limit en formulario de contacto (Fase 1)

## Problema

`POST /Enviar` (`WebController@store`) enviaba correo sin límite de frecuencia. Un bot podía inundar `config('contact.email')` con spam / DoS de correo (`analisis-website01.md` Fase 1 — rate limit).

## Solución

Middleware de throttle en la ruta:

```php
Route::post('/Enviar', [WebController::class, 'store'])->middleware('throttle:5,1')->name('store');
```

**5 envíos por minuto por IP** (igual al patrón ya usado en `routes/auth.php` y `routes/settings.php`). Al superar el límite Laravel responde 429 ThrottleRequestsException.

reCAPTCHA del controller sigue comentado a propósito (no hay claves en `.env`); el throttle es la mitigación inmediata sin dependencias externas.

## Archivos modificados

- `routes/web.php` — `throttle:5,1` en `POST /Enviar`

## Verificación

- Grep: middleware presente en la ruta del store de contacto.
- `php artisan route:list --path=Enviar` muestra el middleware `throttle:5,1`.

## Fases

**Fase 1 (crítico / seguridad)** — abuso del formulario de contacto.
