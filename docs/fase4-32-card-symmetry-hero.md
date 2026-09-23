# Fase 4 — F4-32: Simetría en cards de destacados + hero restaurado

**Fecha:** 2026-09-23  
**Commit:** `fix(ui): equaliza cards destacados y restaura hero (Fase 4)`

## Problema

1. **Cards de destacados asimétricas** (captura del cliente): alturas 626/650/589/650, `imgTop` 366/390/329/390.
2. **Hero de inicio ausente** (`h:0`): tabla `banners` vacía en local; producción sí muestra carousel de 536px.
3. **Marcas sin logos**: `brands.image = NULL` en las 3 filas seed.

## Causa raíz (UI)

| Causa | Efecto |
|---|---|
| Fila Destacados con `items-start` | Cards no se estiran a la altura máxima |
| `Content` sin `min-h` | Bloque de texto 269px vs 306px (productos sin `summary`) |
| `Banner1` con `lg:gap-[64px]` vs `Banner` con `sm:gap-[40px]` | `imgTop` 390 vs 366 al envolver la imagen |
| Imágenes de tamaño distinto en `Banner1` (`215×240` vs `240×240`) | Ancho/posición de imagen desalineada |
| `Banner1` renderizaba `<p>{product.summary}</p>` siempre | Espacio fantasma si summary vacío |

## Cambios

### UI — `resources/js/pages/web/components/Banner.tsx`

- Fila Destacados: `items-start` → **`items-stretch`**
- Card: **`flex flex-col`** + contenedor interno `flex-1 items-start`
- `Content`: **`min-h-[306px]`** en ambos banners (igual que el bloque más alto)
- Gap unificado a **`sm:gap-[40px]`** (se elimina `lg:gap-[64px]`)
- Imágenes de `Banner1`: **`size-[160px]/[200px]/[240px]`** (mismo que `Banner`)
- `summary` condicional en `Banner1` (mismo patrón que `Banner`)

### Datos — seed (BD local, no en git)

- 3 banners homepage `pages=["1"]` con assets en `public/data/banners/`:
  - `e002f7b5-….png` (descargado de producción)
  - `fe1abb42-….png` (huérfano local existente)
  - `16fe437f-….png` (banner de marca)
- `brands.image` → logos en `data/banners/` (usa `Brand::folder_banner`):
  - Samsung, LG, Mueblería Andes
- Cache `web_banners_1` / `web_marcas` limpiada

### Assets — `public/data/`

- Banner hero de producción + logos de marca descargados
- WebP no regenerable en este entorno (GD sin `imagewebp`); el hero usa `<img>` PNG

## Verificación (1-2 checks)

**Check 1 — métricas DOM local** (`symmetric: true`):

| Métrica | Antes | Después |
|---|---|---|
| Card height | 626, 650, 589, 650 | **626 × 4** |
| contentH | 306, 306, 269, 306 | **306 × 4** |
| imgTop | 366, 390, 329, 390 | **366 × 4** |
| imgW | 240 / 215 | **240 × 4** |
| Hero height | 0 | **804px** (3 slides) |
| Marcas logos | placeholder | **3/3 con imagen** |

**Check 2 — gates:** ESLint `Banner.tsx --max-warnings 0` + `npx tsc --noEmit` → OK

Consola: solo HMR/DevTools, sin errores.

## Fuera de alcance / datos

- Imágenes de producto que no coinciden con el nombre (F4-30): data quality
- WebP de banners nuevos: GD sin soporte en CLI
- Semilla BD no viaja en git; reintegrable con el mismo script seed
