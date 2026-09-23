# Fix — Imágenes de productos + categorías (Fase 4)

## Problema

1. Las **8 imágenes de producto** no coincidían con título/descripción
   (teléfonos, TV, earbuds y bocinas en lugar de refrigeradoras, lavadoras,
   sofás y comedores).
2. Categoría **Comida** no debía existir (5→4 tras F4-39).
3. Categoría **Electrodomésticos** tenía imagen de control/teclado (no
   electrodoméstico).

## Solucion

- Descarga de fotos reales desde producción
  (`website01.weblinksrl.com/data/products/…`) y Unsplash para muebles;
  se copian a `public/data/products/` + `thumbs/` con UUID nuevos.
- Script `.php` temporal actualiza `products.image` (ids 1–8):

| # | Producto | Imagen |
|---|---|---|
| 1 | Refrigeradora Samsung 400L | Samsung top-mount (prod) |
| 2 | Refrigeradora LG 350L | Refrigerador oscuro (prod) |
| 3 | Lavadora Samsung 18kg | Samsung top-load (prod) |
| 4 | Lavadora LG 16kg | LG Direct Drive 12kg (prod) |
| 5 | Sofá Modular 3 cuerpos | Sofá terciopelo verde |
| 6 | Sofá Esquinero L | Sofá gris con cojines |
| 7 | Comedor 6 puestos Roble | Comedor madera 6 puestos |
| 8 | Mesa de Comedor Vidrio | Comedor blanco+sillas verdes |

- **Comida**: se elimina la fila `categories` id=4 + PNG
  `db298de8-a3ba-…` (productos no apuntaban a ella).
- **Electrodomésticos**: nueva imagen `025f5ab6-….png` (lavadora LG).

## Archivos modificados

- `public/data/products/*` (8 pares full+thumb) — binarios nuevos
- `public/data/categories/025f5ab6-….png` (+ thumb)
- `public/data/categories/db298de8-a3ba-….png` eliminado
- BD local (no viaja en git): `products.image`, `categories` delete id=4

## Verificacion

- Home `/`: menú sin "Comida"; categorías 1/2/3/5 con imágenes 200
- `/productos/cocina`: 8 cards con `naturalWidth>0`; thumbs 200
- HEAD HTTP 200 en full + thumb de los 8 productos y categoría electro
- `artisan test --compact` no aplica a binarios/BD; CI en push

## Commit

`fix(data): imagenes de productos y categorias correctas (F4-44)`
