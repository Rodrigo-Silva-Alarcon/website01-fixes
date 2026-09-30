# F4-72 — Show.tsx clonados de texts reescritos por entidad (§ lista pendientes)

## Problema

`banners/Show.tsx`, `brands/Show.tsx`, `categories/Show.tsx`, `products/Show.tsx` y
`subcategories/Show.tsx` eran **clones literales de `texts/Show.tsx`** (228 líneas;
única diferencia =17 líneas de nombres de permiso):

- Desestructuraban `{ text }` pero los controladores pasan `banner`/`brand`/`category`/
  `product`/`subcategory` → `text` undefined → **crash** al renderizar (`text.name`).
- Título "Detalles del Texto", campos de texto (Fecha/Género/Tipo), breadcrumbs y
  links de volver/editar apuntaban a `/admin/texts/{id}` (edición del texto equivocado).
- Los controladores pedían la página con minúscula (`admin/products/show`) pero el
  archivo es `Show.tsx` → `resolvePageComponent` falla en **Linux** (prod, case-sensitive).

Además, los 5 `Index` de catálogo no tienen botón "Ver" (solo texts/users/roles/
permissions), por lo que las páginas solo eran accesibles por URL directa — bug no
detectado.

## Cambios

| Archivo | Cambio |
|---|---|
| `admin/{products,categories,subcategories,brands,banners}/Show.tsx` | Reescritos: prop real de la entidad, campos específicos (p. ej. producto: categoría/marca/estado/destacado/popular, banner: tipo/enlace/vigencia/páginas), permisos `show_*`/`edit_*` del sector, breadcrumbs y rutas propias |
| `Admin/{Banner,Brand,Category,Inventory,Product,Subcategory}Controller.php` | `Inertia::render('admin/x/show')` → `'admin/x/Show'` (case correcto del archivo; inventarios incluido, su Show ya era propio) |
| `docs/fase1-16-checklist-env-produccion.md` | Deploy: añadido `db:seed --force` |

## Hallazgo durante la QA (BD local desincronizada)

La primera QA devolvió **403 en las 5 rutas**: la BD local (rebuild 22/09) no tenía
los permisos `view_*` de catálogo que F4-23 crea vía `PermissionSeeder` (idempotente,
`firstOrCreate`). Ejecutado:

```
php artisan db:seed --class=PermissionSeeder --force
php artisan db:seed --class=SectorPermissionsSeeder --force
php artisan db:seed --class=RolePermissionSeeder --force
```

→ 97 permisos; rol `admin` con `view_products`/`view_carts`/etc. **Implicación prod:**
sin `db:seed` en el deploy, el middleware `permission:view_*` de F4-23 bloquearía el
admin de catálogo entero (ahora documentado en el checklist F1-16).

## Verificación (QA browser, login admin)

- `/admin/products/1` → `Producto: Refrigeradora Samsung 400L`, card "Detalles del Producto"
- `/admin/categories/1` → `Categoría: Electrodomésticos`; subcategories → `Subcategoría: Refrigeradoras`
- `/admin/brands/1` → `Marca: Samsung`; `/admin/banners/1` → `Banner: Banner 1 — Smart House`
- `isClonedFromTexts: false` e `isCrash: false` en las 5; **0 console errors, 0 failed requests**
- `npm run build` OK; `php artisan test --compact` → 130 passed; `npm run lint` → 0 errors
