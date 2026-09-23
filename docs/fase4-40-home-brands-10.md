# Fix — Home con 10 marcas como el original (Fase 4)

## Problema

El home local solo tenía 3 marcas (Samsung, LG, "Mueblería Andes") frente
a las 10 del sitio original:

| Original | Local (antes) |
|---|---|
| Samsung, Philips, LG, Magafesa, Haier, Premier, Sony, Xiaomi, Hisense, Redragon | Samsung, LG, Mueblería Andes |

Además la marca 3 se llamaba "Mueblería Andes" pero ya usaba la imagen
`79325917…png` (Philips en producción).

## Solucion

Seed en `database.sqlite` (patrón F4-30/32; la BD no viaja en git):

1. Renombrar marca 3 → **Philips** (imagen ya correcta).
2. Crear 7 marcas nuevas con imágenes de `public/data/banners/`:

| Marca | Archivo |
|---|---|
| Magafesa | `76a9d45d-141e-4f45-9c35-53d822e9f326.jpg` |
| Haier | `c6ae2827-3857-4ff7-a740-4abfb161369e.jpg` |
| Premier | `4c70446b-599d-4898-af19-f8474cdec197.jpg` |
| Sony | `1d2c367f-c0a0-41ac-a942-8781e3f1c0c1.jpg` |
| Xiaomi | `19e98a61-2b01-476a-98ef-454a9482603a.png` |
| Hisense | `8891d286-cb6e-427f-b2c9-69a56847b9a1.png` |
| Redragon | `8a93f9c0-506b-477b-a506-05a35e4dbfe7.png` |

3. `active=1`, `order=1..10`; `Cache::forget('web_marcas')`.

`WebContentService::marcas()` ya hace `limit(10)` → caben exactas.

## Archivos modificados

- `public/data/banners/8a93f9c0-506b-477b-a506-05a35e4dbfe7.png` (nuevo)
- `database.sqlite` (seed local, **no** commiteado)

## Verificacion

- Script PHP: 10/10 filas con `file=OK`
- Navegador: 10 `<img>` en sección Marcas con `naturalWidth>0` y
  `complete=true`; sidebar de filtros lista las 10 marcas

## Commit

`feat(seed): 10 marcas en home como el original (Fase 4)`
