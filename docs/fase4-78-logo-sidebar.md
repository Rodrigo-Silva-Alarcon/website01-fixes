# F4-78 — Logo del sidebar del admin se renderiza como un guion

## Problema

Al comparar el dashboard admin local con el CMS original
(`https://website01.weblinksrl.com/admin/dashboard`), el wordmark de la
cabecera del sidebar se veía como un **guion naranja** en lugar del logo
completo "SMART HOUSE".

Causa raíz: `SidebarMenuButton` (shadcn) incluye la regla
`[&>svg]:size-4` que fuerza **16×16 px** a cualquier SVG hijo directo. Esa
regla (especificidad `clase > svg`) gana sobre la clase `h-8` propia del
SVG. El logo original ("Lg", viewBox `0 0 64 48`) a 16 px seguía siendo
legible; nuestro wordmark (viewBox `0 0 300 48`) reducido a 16×16
letterboxea el contenido a ~16×2.5 px → ilegible.

Diagnóstico verificado midiendo en el navegador: el `<svg>` de la cabecera
del sidebar medía **16×16 px** (debería ser 200×32 a `h-8`).

## Cambios

| Archivo | Cambio |
|---|---|
| `resources/js/components/app-sidebar.tsx` | Logo con clases `important` (`h-8! w-auto!`) que vencen a `[&>svg]:size-4`; al colapsar el sidebar (`useSidebar().state === 'collapsed'`) se muestra `variant="icon"` (casa, viewBox 48×48) a `size-4!` en lugar del wordmark aplastado; se elimina `group-data-[collapsible=icon]:h-5` (sustituido por el cambio de variante) |

No se toca ningún otro uso de `AppLogoIcon`: el hero del dashboard
(`h-24`), los layouts de auth y la cabecera pública usan contenedores sin
reglas `[&>svg]` y renderizan bien (verificado).

## Contexto de la comparación con el CMS original

De las diferencias observadas entre capturas (original prod vs local):

- **Menú del sidebar**: la diferencia se debe a que se compararon cuentas
  distintas (prod: "Visualizador de Textos" sin autorización por recurso;
  local: "Editor de Textos" con RBAC §1.1). La cuenta **admin local sí
  muestra los 9 botones originales** + Roles/Permisos/Textos (§6.2).
  Decisión del usuario: **mantener el RBAC actual** (no otorgar permisos
  de catálogo a los roles de texto).
- **Hero "Bienvenidos al gestor de contenidos"**: ya existe en el dashboard
  local (estaba por debajo del corte de la captura).
- **Logo del sidebar**: bug real → resuelto en este fix.

## Verificación

- `php artisan test --compact` → **137 passed (731 assertions)**.
- `npm run lint` → **0 errors / 217 warnings**; `npm run build` OK.
- **QA browser (one-shot)**: login admin → `/admin/dashboard`:
  - expandido: logo medido **200×32 px** (antes 16×16), captura con el
    wordmark completo visible;
  - colapsado: logo medido **16×16 px** con `variant="icon"` (casa
    reconocible), captura correcta;
  - re-expandido: vuelve a 200×32; 12 items de menú para admin;
  - **0 console errors / 0 requests fallidos**.
