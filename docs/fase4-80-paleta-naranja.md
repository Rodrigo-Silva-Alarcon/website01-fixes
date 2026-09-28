# F4-80 — Retematización completa: paleta azul heredada → paleta naranja de marca

## Problema

El sitio mezclaba **dos identidades visuales**: la marca "Smart House" usa
naranja (logo, hero, CTA del CMS original), pero la app forkeada arrastraba la
paleta azul de la plantilla base (`#006696`/`#0088cc`/`#008ecc`) en tokens
shadcn, utilidades Tailwind generadas, imports de Figma e importaciones de
correo. El resultado era inconsistente: headers, headings, borders, gradientes
y estados primarios en azul contra acentos naranja del contenido.

## Alcance

36 archivos modificados en total (28 de ellos solo retematización + 8 con
fixes funcionales documentados aparte en F4-81). Ejemplos representativos:

| Grupo | Archivos | Cambio |
|---|---|---|
| Tokens globales | `resources/css/app.css`, `resources/js/pages/web/styles/globals.css` | `--primary` / `--sidebar-primary`: `#030213` (negro shadcn) → **`#ea580c`**; `--primary-foreground` blanco |
| Utilidades generadas | `resources/js/pages/web/index.css` | mapeo de clases arbitrarias: `#006696`→`#c2410c`, `#0088cc`→`#ea580c`, `#e0eef3`→`#ffedd5`, `#f0faff`→`#fff7ed`, gradientes `from/to` |
| Interacciones | `resources/css/interactions.css` | estados hover/focus primarios a naranja |
| Imports Figma | `web/imports/Info.tsx`, `Info-1-536.tsx`, `Info-1-61…`, `Frame10124093*.tsx`, `Frame10124094.tsx` | `fill`/`stroke`/`text-[#00…]` azules → naranja |
| Páginas storefront | `HomePage`, `ProductosPage`, `ProductDetailPage`, `CheckoutPage`, `CheckoutSuccessPage`, `ContactoPage`, `CuentaPage`, `FindProductsPage`, `Banner`, `Categorias`, `Marcas` | headings, botones, links, precios y badges primarios |
| Páginas admin | `dashboard`, `permissions/Index|Show`, `roles/Show|_form`, `users/Index|Show`, `banners/_form` | acentos y CTA |
| Auth / email | `auth/login.tsx`, `auth-simple-layout.tsx`, `emails/layout.blade.php` | cabecera y botón del correo de reset |

Paleta resultante: primario **`#ea580c`** (naranja-600), superficies de marca
`#c2410c` (naranja-700, barra de entrega), tintes `#ffedd5`/`#fff7ed`
(naranja-100/50) y blancos cálidos.

## Verificación

- **Auditoría estática**: `audit_palette.py` + barrido browser por ~40 rutas
  (storefront + admin) → **0 ocurrencias de azules legacy** (`#006696`,
  `#0088cc`, `#008ecc`, `#e0eef3`, `#f0faff`, `#030213`) y **0 errores de
  consola**.
- `npm run build` OK; `npm run lint` → **0 errors / 215 warnings** (baseline).
- Evidencia documental: capturas `pair-*-despues` del informe APA regeneradas
  sobre la paleta nueva (barra superior mide `rgb(194,65,12)` vs
  `rgb(0,102,150)` en `pair-*-antes`).
