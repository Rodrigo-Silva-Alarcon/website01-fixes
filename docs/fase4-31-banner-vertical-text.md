# Fase 4-31 — Texto vertical en cards de destacados (Banner)

**Fecha:** 2026-09-23  
**Commit:** `fix(ui): evita texto vertical en cards destacados (Fase 4)`  
**Archivos:** `resources/js/pages/web/components/Banner.tsx`

## Problema

En la sección de productos destacados del home, los títulos de las cards se renderizaban **verticalmente (un carácter por línea)**, con alturas de ~900–1100px por `P` y ancho computado `0px`.

Captura reportada por el usuario y reproducida localmente en `/` (sección tras «Categorías»).

## Causa raíz

Estructura de cada card (`Banner` / `Banner1`):

```
flex-row (sm:)  gap-40 (sm:) / gap-64 (lg: en Banner1)
├── Content: flex: 1 0 0  (basis-0 + grow + shrink-0)  min-w-0
└── imagen:  shrink-0  size-240 (lg) / 215 (lg en Banner1)
```

- La card mide ~316px → con `p-20` el ancho útil es **276px**.
- `gap-40 + imagen-240 = 280 > 276` → **espacio libre negativo**.
- `flex-grow` solo distribuye espacio libre **positivo**; con `shrink-0` en Content e imagen, nadie encoge → Content queda en **`width: 0`**.
- `overflow-wrap: break-word` sobre ancho 0 → un carácter por línea (texto vertical).

Agravante: los breakpoints `sm:`/`lg:` son de **viewport**, no del ancho de la card. Con 4 banners en fila dentro de `max-w-1440`, cada card es estrecha aunque el viewport sea ≥1024px (`lg:size-240` activo).

## Corrección

En ambos `Banner` y `Banner1` (`Banner.tsx`):

1. **`sm:flex-wrap`** en el contenedor flex-row: si `Content + gap + imagen` no caben en 276px, la imagen **envuelve a la siguiente línea** en lugar de exprimir el texto.
2. **`min-w-[160px]`** en `Content` (antes `min-w-0`): el texto nunca colapsa a ancho 0 aunque cambien tamaños/gaps futuros.

En cards estrechas (4 en fila): texto arriba a ancho completo (276px), imagen centrada debajo.  
En cards suficientemente anchas (1–2 banners): layout horizontal original.

## Verificación

1. **Screenshot** tras HMR: títulos horizontales y legibles (`Refrigeradora Samsung 400L…`), imagen debajo del bloque de texto; variantes clara y oscura.
2. **Medición DOM**: 4/4 `[data-name="Content"]` con `width: 276` (0 con ancho 0), `flex-wrap: wrap` en el padre, imagen en `top` distinto (línea envuelta). Consola: solo HMR de `Banner.tsx`/`app.css`, sin errores nuevos.

Gates CI en push: linter + tests.

## Limitaciones / no cubierto

- Solo se tocó la sección de **destacados** del home (`Banner.tsx`). Otros clons Figma con el patrón `basis-0 … shrink-0` + imagen fija podrían tener el mismo fallo en otros anchos (no reportado).
- El diseño apila imagen debajo del texto en cards estrechas (comportamiento intencionado del wrap); en viewports con 1–2 banners mantiene el lado a lado.
