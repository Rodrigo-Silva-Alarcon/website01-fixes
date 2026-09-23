# Fix 31 — Eager load de brand en listado de productos (Fase 3)

## Problema

`analisis-website01.md` §4.2.1 (N+1 crítico): `get_products()` no incluía `brand` en `with([...])`. Cada card de producto que accede a `brand_label` disparaba una query extra a `brands`.

Eager loads ya presentes: `inventory`, `category`, `subcategory`. Faltaba solo `brand`.

## Solución

`app/Traits/WebTrail.php` → `get_products()`:

```php
->with(['inventory', 'category', 'subcategory', 'brand'])
```

Otras rutas (`get_populares`, `get_detacados`, detalle de producto, relacionados) ya incluían `brand`.

## Archivos modificados

- `app/Traits/WebTrail.php`

## Verificación

- `artisan test --compact` → **86/86**.
- `npx tsc --noEmit` → 0 errores.

## Fases

**Fase 3 (calidad / rendimiento)** — `analisis-website01.md` §4.2.1.
