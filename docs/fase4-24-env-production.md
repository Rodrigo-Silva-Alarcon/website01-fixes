# Fase 4-24 — Configuración de producción en `.env.example` (§4.6.2)

## Problema

`analisis-website01.md` §4.6.2: `.env.example` solo reflejaba el entorno local
(sqlite + `MAIL_MAILER=log` + `APP_DEBUG=true`). No había guía de variables de
producción en el propio archivo, y el checklist de Fase 1 (`fase1-16`) vivía
solo en docs.

## Cambios

| Archivo | Cambio |
|---|---|
| `.env.example` | Comentarios de locale `es`, bloque **PRODUCTION** comentado (APP_ENV/DEBUG/URL, MySQL, Redis, SMTP), sin secretos reales |
| `docs/fase4-24-env-production.md` | Este doc |

No se modificó `.env` local (sigue `local`/`true` para desarrollo).

## Variables de producción (resumen)

| Variable | Valor prod |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://website01.weblinksrl.com` |
| `SESSION_SECURE_COOKIE` | `true` |
| `DB_*` | Credenciales del servidor (no inventar) |
| `MAIL_*` / `CONTACT_EMAIL` | **Pendiente de cliente** |

Tras deploy: `migrate --force`, `config:cache`, `route:cache`, `view:cache`.

## Verificación

- `.env` local intacto (`APP_ENV=local`, `APP_DEBUG=true`).
- `.env.example` sin credenciales reales.

## Commit

`docs(env): variables de producción en .env.example (Fase 4)`
