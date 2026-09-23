# Fase 4 · Fix F4-33 — Gates RBAC de frontend del catálogo

**Fecha:** 2026-09-23  
**Commit:** `fix(admin): gates RBAC de catálogo y links rotos (Fase 4)`

## Problema

F4-23 creó permisos granulares por sector (`create_*`, `edit_*`, `show_*` para
products/categories/subcategories/brands/banners/inventories), pero las páginas
Create/Edit/Show del catálogo seguían comprobando `create_texts` / `edit_texts` /
`show_texts` (clones de la plantilla de Textos).

Efectos:

- Un admin con todos los permisos funcionaba, pero **editor_textos** (solo
  `*_texts`) veía los formularios de catálogo y **un usuario con solo
  `create_products` no accedía** a Crear producto.
- Redirects incorrectos: categorías → `/admin/texts`; producto Edit →
  `subcategories.index`.
- Inventarios: Create tenía el gate **comentado**; Edit **sin gate**.
- `texts/Index`: permiso de publicar mal escrito `publish_texts_texts`.
- Búsqueda en Marcas redirigía a `banners.index`.
- Link "volver" en `_form` de productos era string literal
  `"{ route('products.index')}"`.

## Cambios (20 archivos)

### Create/Edit → permiso de sector

| Página | Antes | Después |
|---|---|---|
| products Create/Edit | `create_texts` / `edit_texts` | `create_products` / `edit_products` |
| categories Create/Edit | `create_texts` / `edit_texts` | `create_categories` / `edit_categories` |
| subcategories Create/Edit | `create_texts` / `edit_texts` | `create_subcategories` / `edit_subcategories` |
| brands Create/Edit | `create_texts` / `edit_texts` | `create_brands` / `edit_brands` |
| banners Create/Edit | `create_texts` / `edit_texts` | `create_banners` / `edit_banners` |
| inventories Create | gate comentado | activo `create_inventories` |
| inventories Edit | sin gate | `edit_inventories` |

Toasts y redirects alineados al recurso real (`*.index` del sector).

### Show → `show_*` + botón `edit_*`

products, categories, subcategories, brands, banners: gate
`show_<sector>`, botón Editar con `edit_<sector>`, redirect a
`<sector>.index` + `import { route } from 'ziggy-js'`.

### Nav / permisos tipográficos

- `brands/Index` search: `banners.index` → `brands.index`
- `products/_form`: href literal → `route('products.index')`
- `texts/Index`: `publish_texts_texts` → `publish_texts`

Los clones de Show siguen siendo plantilla de Textos (contenido); solo se
corrigieron gates y redirects (ver CHANGELOG bloqueados).

## Roles esperados (semilla actual)

| Rol | Catálogo Create/Edit | Show |
|---|---|---|
| admin (todos) | sí | sí |
| editor_textos | no (403 backend + null FE) | no |
| viewer_textos | no | no |

## Verificación (1-2 checks)

1. `npm run types` → OK; `php artisan test --compact` → **118 passed (631 assertions)**
2. Grep: sin `create_texts`/`edit_texts`/`show_texts` en
   `{products,categories,subcategories,brands,banners,inventories}`
   (solo queda en `texts/`); brands search usa `brands.index`

ESLint del repo: `npm run lint` (`eslint . --fix`, warnings preexistentes no
bloquean CI). TSC sin errores.
