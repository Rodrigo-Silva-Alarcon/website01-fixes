# Fix 18 — Sitemap.xml dinámico (Fase 2)

## Problema

No existía `sitemap.xml` ni referencia en `robots.txt`. Los buscadores no tenían un mapa del catálogo (home, categorías, subcategorías, marcas, productos).

## Solución

1. **`app/Http/Controllers/SitemapController.php`** (invocable):
   - Estáticas: `/`, `/Productos`, `/Nosotros`, `/Contactanos`.
   - Categorías publicadas + subcategorías activas (slug del mutador de `Category`).
   - Marcas publicadas (`/Marcas/{id}` — Brand **no tiene slug**; el front usa `brand.id`).
   - Productos publicados por chunk (200) con categoría activa; subcategoría o `All`.
   - `lastmod` ISO-8601 (`toIso8601String`); `Content-Type: application/xml`.

2. **Ruta** `GET /sitemap.xml` → `sitemap` en `routes/web.php`.

3. **`public/robots.txt`**: añade `Sitemap: /sitemap.xml` (ruta relativa válida en muchos crawlers; en producción puede absolutizarse con el dominio real — no hardcodear localhost).

## Archivos modificados

- `app/Http/Controllers/SitemapController.php` (nuevo)
- `routes/web.php`
- `public/robots.txt`

## Verificación

- `GET /sitemap.xml` → **200**, `application/xml`, **22** `<loc>` con seed local.
- `vendor/bin/pest` → **78 passed**.
- Marca por `id` (no `slug` inexistente).

## Fases

**Fase 2 (SEO / sitemap.xml)** — `analisis-website01.md` §7: rutas + productos.
