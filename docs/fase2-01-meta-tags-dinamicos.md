# Fix 17 — Meta tags SEO dinámicas por página (Fase 2)

## Problema

Todas las páginas públicas compartían el mismo `<title>` por defecto (`APP_NAME` / "Laravel") y **no tenían** `meta description`, Open Graph ni Twitter Card. Crawlers y previews de redes sociales veían el mismo título genérico en home, Nosotros, Contacto, Productos y detalle de producto.

Evidencia previa: `document.title` = `Laravel` (o similar) en todas las rutas; sin `meta[name="description"]`.

## Solución

1. **Nuevo componente** `resources/js/components/Seo.tsx`:
   - Usa `Head` de `@inertiajs/react`.
   - Emite: `<title>`, `meta description`, `link canonical`, `og:*` (type, site_name, title, description, image, url), `twitter:*`.
   - `SITE_NAME = "SmartHouse"`; `DEFAULT_IMAGE = "/apple-touch-icon.png"` (recurso existente).
   - El `<title>` del componente solo lleva el **nombre de página**; el callback global de Inertia (`app.tsx` / `ssr.tsx`: `` `${title} - ${appName}` ``) añade el sufijo de marca → evita duplicar el nombre del sitio.
   - `og:title` sí lleva `Página | SmartHouse` completo.

2. **Páginas públicas** que montan `<Seo …>`:
   - `HomePage` — título "Inicio"
   - `AboutPage` — "Sobre nosotros"
   - `ContactoPage` — "Contáctanos"
   - `ProductosPage` — "Productos"
   - `ProductDetailPage` — nombre del producto + summary/description (strip HTML) + `og:type=product` + `og:image` del producto
   - `FindProductsPage` — "Buscar productos"

3. **Branding**: `.env` local `APP_NAME=SmartHouse` (antes `Laravel`) para que el suffix de Inertia diga `… - SmartHouse`. `.env` está en `.gitignore`; en producción documentar `APP_NAME=SmartHouse` (ver `docs/fase1-16-checklist-env-produccion.md`).

## Archivos modificados

- `resources/js/components/Seo.tsx` (nuevo)
- `resources/js/pages/web/HomePage.tsx`
- `resources/js/pages/web/AboutPage.tsx`
- `resources/js/pages/web/ContactoPage.tsx`
- `resources/js/pages/web/ProductosPage.tsx`
- `resources/js/pages/web/ProductDetailPage.tsx`
- `resources/js/pages/web/FindProductsPage.tsx`

## Verificación

- Home: `document.title` → **`Inicio - SmartHouse`**; `meta description` presente; `og:title` → `Inicio | SmartHouse`; canonical `http://127.0.0.1:8000/`.
- `npx tsc --noEmit` → 0 errores.
- `npx eslint` sobre los archivos tocados → **0 errors** (solo warnings preexistentes de vars sin usar).
- `npm run build` → OK.

## Fases

**Fase 2 (SEO / meta tags dinámicos)** — `analisis-website01.md` §7: meta tags en todas las páginas.
