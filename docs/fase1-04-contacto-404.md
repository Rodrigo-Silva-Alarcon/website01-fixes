# Fix 4 — /Contacto 404 → redirección + enlace en header (Fase 1)

## Problema

- La URL `/Contacto` (y `/contacto`) devolvía **404** porque la ruta canónica era `/Contactanos` (`routes/web.php`, nombre `contact`).
- El header desktop **no tenía ningún enlace a Contacto** — solo Home, Nosotros y Ofertas — por lo que el usuario no tenía forma de llegar a la página de contacto desde la navegación principal (bug reportado en `analisis-mejoras-website01.md` §1.3 y `analisis-website01.md:359-360`).

## Cambios

| Archivo | Cambio |
|---|---|
| `routes/web.php` | `Route::redirect('/Contacto', '/Contactanos')` y `Route::redirect('/contacto', '/Contactanos')` (aliases 301/302 para URLs legacy) |
| `resources/js/pages/web/components/Header.tsx` | Nuevo botón **Contacto** en el header desktop → `route('contact')` (estilo pill consistente con Nosotros/Ofertas) |
| `tests/Feature/StorefrontTest.php` | `it('redirects legacy /Contacto URLs to /Contactanos')` — asserts GET `/Contacto` y `/contacto` → redirect a `/Contactanos` |

## Pruebas

- `php -l routes/web.php` → sin errores de sintaxis.
- `php -l tests/Feature/StorefrontTest.php` → sin errores de sintaxis.
- Verificación estática: `Contacto` presente en `Header.tsx:247` con `href={route('contact')}`; redirecciones registradas en `routes/web.php` inmediatamente después de la ruta canónica.
- Pest no ejecutable localmente (PHP 8.2 < lock ≥8.3); el test queda listo para CI.

## Fase

**Fase 1 — crítico** (contacto 404).

## Commit

`fix(funcional): redirigir /Contacto a /Contactanos y añadir enlace de contacto en header (Fase 1)`
