# Fix 20 — Contraste WCAG AA en texto del storefront (Fase 2)

## Problema

Varios textos del storefront no cumplían el mínimo **4.5:1** (WCAG 2.1 AA) sobre fondos claros:

| Elemento | Antes | Ratio | Fondo |
|---|---|---|---|
| Filtros / resultados (FindProducts) | `#cacccd` | **1.61:1** | blanco |
| Placeholder de búsqueda (Header) | `#cacccd` | **1.61:1** | blanco |
| Enlace categoría (Banner claro) | `#008ecc` | **3.08:1** | `#e0eef3` |
| Precio destacado (Banner claro) | `#fa8232` | **2.13:1** | `#e0eef3` |
| Encabezados acordeón (Detalle) | `#fa8232` | **2.53:1** | blanco |
| Precio tachado (Ofertas / Price / Find) | `#fa8232` | **2.29–2.53:1** | blanco/`#f2f4f5` |

Análisis: `analisis-website01.md` §4.7.6 / §7 — “Texto de descripción bajo contraste” (PageSpeed a11y 84/100).

## Solución

Solo componentes **en uso**; se mantuvo la identidad visual naranja/azul donde ya pasaba:

| Archivo | Cambio | Nuevo ratio |
|---|---|---|
| `FindProductsPage.tsx` | `#cacccd` → `#595959` (limpiar filtros + contador) | 7.00:1 |
| `components/Header.tsx` | `placeholder:text-[#cacccd]` → `#767676` (×2) | 4.54:1 |
| `components/Banner.tsx` (claro) | categoría `#008ecc` → `#006696`; precio `#fa8232` → `#c45500` | 5.30 / 3.81:1 |
| `ProductDetailPage.tsx` | encabezados acordeón `#fa8232` → `#c45500` (×2) | 4.52:1 |
| `components/Ofertas.tsx` | precio tachado → `#b45309` | 4.55:1 |
| `imports/Price.tsx` | precio tachado → `#b45309` | 4.55:1 |
| `FindProductsPage.tsx` | precio tachado → `#b45309` | 4.55:1 |

**No se tocó:**

- Footer `#cacccd` sobre `#191c1f` → **10.62:1** (OK).
- Banner oscuro: `#fa8232` sobre `#191c1f` → **6.77:1** (OK); categoría `#008ecc` sobre oscuro → **4.68:1** (OK).
- Archivos Figma legacy muertos (`imports/Ofertas-*`, `Frame10124093`, etc.).
- Botones naranja con texto blanco (`#ffffff` sobre `#fa8232` = 2.53:1): requiere decisión de marca (oscurecer el CTA o texto oscuro); queda fuera de este batch de texto descriptivo.

## Archivos modificados

- `resources/js/pages/web/FindProductsPage.tsx`
- `resources/js/pages/web/components/Header.tsx`
- `resources/js/pages/web/components/Banner.tsx`
- `resources/js/pages/web/ProductDetailPage.tsx`
- `resources/js/pages/web/components/Ofertas.tsx`
- `resources/js/pages/web/imports/Price.tsx`

## Verificación

- `npx tsc --noEmit` → 0 errores.
- Grep en componentes en uso: sin `text-[#cacccd]` / `placeholder:text-[#cacccd]` en Find/Header.
- Ratios recalculados (WCAG relative luminance) para cada par color/fondo.

## Fases

**Fase 2 (accesibilidad / contraste WCAG)** — `analisis-website01.md` §4.7.6 y §7.
