# Fix 16 — Checklist `.env` de producción (Fase 1)

## Problema

`.env` local sigue en modo desarrollo (`APP_ENV=local`, `APP_DEBUG=true`, `CONTACT_EMAIL="hello@example.com"`). Sin un checklist de despliegue, un deploy a producción podría dejar debug activo (stack traces públicos) o el email de contacto de ejemplo.

## Solución (checklist — no se inventan valores del cliente)

Antes de producción, en el `.env` del servidor:

| Variable | Valor de producción | Nota |
|---|---|---|
| `APP_ENV` | `production` | |
| `APP_DEBUG` | `false` | Nunca `true` en prod |
| `APP_URL` | URL pública real (p. ej. `https://website01.weblinksrl.com`) | Debe coincidir con el dominio |
| `CONTACT_EMAIL` | Email real del cliente | **Pendiente de cliente** — no inventar |
| `MAIL_FROM_ADDRESS` | Email remitente real | **Pendiente de cliente** |
| `APP_KEY` | Clave única de prod (`php artisan key:generate --force` solo si se genera en el servidor) | No reutilizar la de local |
| `SESSION_SECURE_COOKIE` | `true` | Si se sirve por HTTPS |
| `DB_*` | Credenciales del servidor | Nunca commitear |

También revisar:

- `php artisan config:cache` y `php artisan route:cache` tras el deploy.
- `storage/` y `bootstrap/cache/` con permisos de escritura para el usuario web.
- `php artisan migrate --force` en el deploy.

## Archivos

- Solo documentación: este archivo. **No** se modifica el `.env` de local (sigue `local`/`true` para desarrollo).

## Verificación

- Local intacto: `APP_ENV=local`, `APP_DEBUG=true` (comportamiento de desarrollo preservado).
- El checklist es operativo para el deploy real cuando el cliente confirme emails.

## Fases

**Fase 1 (crítico / despliegue)** — `APP_DEBUG` en producción es hallazgo crítico de seguridad/estabilidad del análisis.
