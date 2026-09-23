# Fase 4-05 — Banners con fechas de vigencia (§4.6.4)

## Problema

Los banners solo se filtraban por `active`. No había forma de programar su aparición
(activar/desactivar automáticamente por fecha) sin intervención manual.

## Cambios

| Archivo | Cambio |
|---|---|
| `database/migrations/..._add_schedule_dates_to_banners.php` | Añade `start_date` y `end_date` (nullable, date) a `banners` |
| `app/Models/Banner.php` | `fillable`/`casts` con las fechas; `scopeScheduled()`: `active` + ventana (`start` null o ≤ hoy, `end` null o ≥ hoy) |
| `app/Services/WebContentService.php` | `banners()` usa `Banner::scheduled()` en lugar de `where('active', true)` |
| `app/Http/Requests/BannerRequest.php` | Valida `start_date` (date), `end_date` (date, `after_or_equal:start_date`) |
| `resources/js/pages/admin/banners/_form.tsx` | Inputs `type="date"` opcionales en el form admin |
| `resources/js/types/models.ts` | `Banner.start_date?` / `Banner.end_date?` |
| `tests/Feature/BannerScheduleTest.php` | Scope: dentro de ventana / sin fechas → visibles; futuro/expirado/inactivo → ocultos |

## Comportamiento

- Sin fechas → banner siempre visible si `active`.
- Solo `start_date` → visible desde esa fecha en adelante.
- Solo `end_date` → visible hasta esa fecha inclusive.
- Ambas → solo dentro de la ventana (inclusive).
- `active = false` → nunca visible.

## Verificación

- `artisan test --compact` → **92 passed (420 assertions)**
- `npx tsc --noEmit` → OK
- `npx eslint .` → 0 errores (347 warnings)

## Commit

`feat(banners): programación de fechas de vigencia (Fase 4)`
