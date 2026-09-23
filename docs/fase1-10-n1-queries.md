# Fix 10 — N+1 en queries del storefront (Fase 1)

## Problema

Varias queries del storefront cargaban filas sin eager-load de relaciones que el frontend consume en el primer render, generando N+1 (una query extra por producto/categoría):

1. **`WebController@product`** — "productos relacionados" se cargaba sin `inventory`; el precio del carrousel dispara una query por fila.
2. **`WebTrail::get_detacados()`** — destacados de home sin `inventory` (mismo problema de precio).
3. **`WebTrail::get_categories_home()`** — categorías de menú/header sin `subcategories` pese a consumirse como menú (y `get_menu()` ya hacía `with('subcategories')` de forma correcta).

`get_populares()`, `get_categories_home_all()` y `get_products()` ya usaban `with(...)`; solo fallaban estas tres rutas.

## Solución

```php
// WebController@product
Product::with('inventory')->where('active', true)...

// WebTrail
Product::with('inventory')->where('featured', true)...
Category::with('subcategories')->where('active', true)...
```

## Archivos modificados

- `app/Http/Controllers/WebController.php` — related products + `inventory`
- `app/Traits/WebTrail.php` — `get_detacados()` + `inventory`; `get_categories_home()` + `subcategories`

## Verificación

- Grep: las tres queries incluyen `with('inventory')` / `with('subcategories')`.
- Home y detalle de producto renderizan sin errores (Vite HMR + `GET /` y `GET /productos/...`).

## Fases

**Fase 1 (crítico / rendimiento)** — N+1 queries en homepage y detalle de producto.
