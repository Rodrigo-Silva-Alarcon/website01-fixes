# Fix — CMS textos conectados al frontend (Fase 4)

## Problema

`analisis-website01.md` §4.6.1 / §4.8.1: la sección Textos CMS del admin no se consume en el frontend; todo el contenido está hardcodeado.

## Solución

1. **`WebContentService::cmsTexts()`** — devuelve los textos publicados (`publish=true`, `content` no vacío) como `name => content`, con `Cache::remember('web_cms_texts', 60)`.
2. **`WebTrail::get_cms_texts()`** — fachada BC.
3. **`HandleInertiaRequests`** — comparte `cmsTexts` solo en rutas públicas; en admin/login queda `[]`.
4. **`Footer.tsx`** — lee claves del CMS con fallback a los valores actuales:
   - `footer_whatsapp` → `https://wa.me/{solo dígitos}`
   - `footer_email` → `mailto:{valor}`

### Claves sugeridas para el cliente (admin → Textos CMS)

| name | uso |
|---|---|
| `footer_whatsapp` | número WhatsApp del footer |
| `footer_email` | email del footer |
| `hero_title` / `about_mission` / etc. | disponibles en `cmsTexts` para páginas siguientes |

## Archivos modificados

- `app/Services/WebContentService.php`
- `app/Traits/WebTrail.php`
- `app/Http/Middleware/HandleInertiaRequests.php`
- `resources/js/pages/web/components/Footer.tsx`
- `tests/Feature/CmsTextsTest.php` (nuevo, 2 tests)

## Verificación

- `artisan test --compact` → **90/90** (418 assertions).
- `npx eslint` / `npx tsc --noEmit` → 0 errores.

## Fases

**Fase 4 (CMS + funcionalidad)** — `analisis-website01.md` §4.6.1.
