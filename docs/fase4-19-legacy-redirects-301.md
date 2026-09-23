# Fase 4-19 — Redirects 301 para rutas legacy (§4.3.3)

## Problema

`Route::redirect` en Laravel devuelve **302** por defecto; el SEO pide **301** permanente para consolidar URLs canónicas (`/Contacto` → `/contactanos`, etc.). Además el fallback SSR de `ProductJsonLd` aún construía `/Productos/...`.

## Cambios

| Archivo | Cambio |
|---|---|
| `routes/web.php` | 8 redirects legacy → tercer argumento `301` |
| `resources/js/components/ProductJsonLd.tsx` | Fallback URL → `/productos/...` minúsculas |
| `tests/Feature/CmsTextsTest.php` | Test: 8 rutas legacy → `assertStatus(301)` + `assertRedirect` |

## Rutas afectadas

`/Contacto` `/contacto` `/Nosotros` `/Productos` `/Marcas` `/Servicios` `/Contactanos` `/Find`

## Verificación

- `artisan test --compact` → **105 passed (577 assertions)**
- `npx tsc --noEmit` → OK
- `npx eslint ProductJsonLd.tsx` → 0 errores

## Commit

`fix(seo): redirects 301 para rutas legacy con mayúsculas (Fase 4)`
