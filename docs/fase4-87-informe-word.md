# F4-87 — Informe Word: sección 3.7 (Panel y CMS), aclaración del logo y métricas

Documento: `C:\Users\ASUS TUF F15\Desktop\Trabajo\Informe_Avances_Website01.docx` (33 páginas, 26 figuras).

## 1. Auditoría: cambios de CMS pedidos por el análisis → implementados

Todo lo mencionado en §6.6 y §13 del análisis está aplicado en el repositorio:

| Hallazgo del análisis | Estado | Fix |
|---|---|---|
| 6.6.1 usuario `example@…` con rol `viewer` roto | ✓ seed `viewer_textos` | — |
| 6.6.2 sidebar sin Roles/Permisos/Textos | ✓ links RBAC | F4-09 |
| 6.6.3 formularios en inglés / labels | ✓ form en español | F4-13 |
| 6.6.4 RBAC limitado a25 permisos de textos | ✓ **97 permisos** de12 entidades | F4-23 |
| 6.6.5 dashboard con solo4 conteos | ✓ widgets de negocio | F4-14 |
| 6.6.6 sin cerrar sesión visible | ✓ botón en nav-user | F4-08 |
| §13 textos del CMS sin conectar al frontend | ✓ `cmsTexts` → footer | F4-04 |
| §13 títulos de navegador | ✓ por página admin | F4-10 |
| §13 locale / textos del panel | ✓ `es` + textos en español | F4-81 |
| §13 CRUDs duplicados | ✓ componentes compartidos | F4-73 / F4-74 |
| QA del panel | ✓0 HTTP500 /0 console errors | F4-81 |

## 2. Cambios en el documento

- **Nueva §3.7 "Panel administrativo y CMS"** (antes de "4. Cobertura"): Problema/Solución/Verificación trazados a §6.6 y §13.
- **Figuras 12–15** (capturas nuevas, fuentes locales, 1440×900):
  - Figura 12 — dashboard con métricas (`/admin/dashboard`).
  - Figura 13 — sidebar con secciones RBAC + botón Cerrar sesión (recorte 720×900).
  - Figura 14 — `/admin/permissions` con97 permisos.
  - Figura 15 — `/admin/texts` con8 textos publicados.
- **Aclaración del logo**: la Figura 1 ahora dice explícitamente *"página inicial"* (logo «Lg» → Smart House); la Figura 5 pasa a *"Panel de administración (CMS): el wordmark del sidebar colapsaba a un guion"* y su Nota explica que **no** es la página inicial (evolución de la inicial = Figura 1).
- **Figura 5b recapturada**: se reemplazó la imagen `image10.png` por un recorte del sidebar actual (wordmark legible,864×201, mismo aspecto que el extent original).
- **Tablas**: Tabla2 + fila "Panel y CMS"; Tabla3 evidencia del panel → "Figuras 12 a 15"; Tabla4 +3 filas (dashboard, sidebar, permisos/textos).
- **Métricas y fechas actualizadas**:87 correcciones (F4-01 a F4-87),118 informes (`docs/*.md`),15 figuras, ESLint0 errores/215 advertencias,18 de75 productos, fecha28 de septiembre de2026.

## 3. Verificación

- `python-docx`:166 párrafos,7 tablas,26 `inline_shapes`; sin restos de "216 advertencias", "16 de los75", "logo colapsado versus" ni "Recorte ampliado".
- Word COM abre el documento:33 páginas,26 figuras,4295 palabras.
- Conteo naranja de píxeles confirma el contenido de cada captura (dashboard287, sidebar210, permisos20, textos162 = toggles).

## 4. Nota de captura (trampa conocida)

`page.screenshot()` de Playwright se colgaba *"waiting for fonts to load"* con `fonts.bunny.net` en estado `loading` (red inestable); durante el hang el texto peso500 salía **invisible** y producía falsos "campos vacíos". Solución aplicada: interceptar `fonts.bunny.net/css**` y `**.woff2` hacia `%TEMP%\opencode\bunnyfonts\` (descarga local previa) + captura vía CDP `Page.captureScreenshot`.
