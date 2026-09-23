# Fix 34 — Refactor WebTrail → WebContentService (Fase 3)

## Problema

`analisis-website01.md` §4.5.1: `App\Traits\WebTrail` concentra queries de home/listado en un trait de 120+ líneas usado por `WebController`, `ShopController` y `HandleInertiaRequests`. Difícil de testear en aislamiento y con lógica de negocio mezclada en el trait.

## Solución

1. **Nuevo `app/Services/WebContentService.php`** — misma lógica (menu, populares, destacados, marcas, banners, categorías, products paginados con `appends`, product detail), tipado y sin depender de un trait concreto.
2. **`app/Traits/WebTrail.php`** — queda como fachada BC: cada método delega a `app(WebContentService::class)`. Controladores y middleware **no cambian** (`use WebTrail;` sigue funcionando).

## Archivos modificados

- `app/Services/WebContentService.php` (nuevo)
- `app/Traits/WebTrail.php` (delegación)

## Verificación

- `artisan test --compact` → **86/86**.
- `npx tsc --noEmit` → 0 errores.

## Fases

**Fase 3 (calidad / rendimiento)** — `analisis-website01.md` §4.5.1.
