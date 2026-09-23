# Fase 4-10 — Títulos de navegador en páginas admin (§4.8.5)

## Problema

Al navegar a Banners, Marcas y Productos el tab del navegador mostraba
**"Subcategorías - Website01"** (copy-paste del `<Head title>` de Subcategorías).

## Cambios

| Archivo | Antes | Después |
|---|---|---|
| `pages/admin/products/Index.tsx` | `Subcategorías` | `Productos` |
| `pages/admin/brands/Index.tsx` | `Subcategorías` | `Marcas` |
| `pages/admin/banners/Index.tsx` | `Subcategorías` | `Banners` |

Los Index de Categorías, Subcategorías, Usuarios, Roles, Permisos, Textos,
Inventarios y Dashboard ya tenían el título correcto.

**Nota:** los `Show.tsx` de products/brands/banners/categories/subcategories son
plantillas clónicas de `texts/Show` (esperan prop `text` y breadcrumbs a
`/admin/texts`). Es un bug de plantilla separado (§4.7.x), no de título; queda
fuera de este fix.

## Verificación

- `npx eslint` en los 3 archivos → 0 errores
- `npx tsc --noEmit` → OK

## Commit

`fix(admin): corregir títulos de navegador en Productos, Marcas y Banners (Fase 4)`
