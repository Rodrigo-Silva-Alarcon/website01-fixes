# Fix — Home: 5 categorías (Fase 4)

## Problema

El home local mostraba solo 3 categorías (Electrodomésticos, Muebles,
Ofertas). El sitio original (https://website01.weblinksrl.com/) muestra 5:
Comida, Electrodomésticos, Cocina, Equipos de sonido, Consolas.

## Solucion

BD local (script PHP temporal; la BD no viaja en git — patrón F4-30/32):

| id | Antes | Despues | image |
|---|---|---|---|
| 1 | Electrodomésticos | Electrodomésticos (slug OK) | `3a2e0861-….png` |
| 2 | Muebles | **Cocina** | `6321a305-….png` |
| 3 | Ofertas | **Equipos de sonido** | `b4ef08ce-….png` |
| 4 | — | **Comida** (nueva) | `db298de8-….png` |
| 5 | — | **Consolas** (nueva) | `7b1343ea-….png` |

- IDs 1-3 se conservan → FK de productos intactos (4+4+0).
- Assets `db298de8…png` (+ thumb) descargados de producción y commiteados.

## Archivos modificados

- `public/data/categories/db298de8-a3ba-4ad3-8ffc-0909aeeee272.png` (nuevo)
- `public/data/categories/thumbs/db298de8-a3ba-4ad3-8ffc-0909aeeee272.png` (nuevo)
- BD local: 5 filas en `categories` (seed, no viaja en git)

## Verificacion

- Script PHP: 5 categorías con imagen PNG existente en disco
- Screenshot home: grid de categorías con 5 items

## Commit

`feat(seed): 5 categorias en home como el original (Fase 4)`
