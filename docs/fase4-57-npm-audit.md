# Fix - npm audit: parches de dependencias (Fase 4)

## Problema

**Shortlist:** `npm audit` reportaba **26 vulnerabilidades**
(3 critical, 17 high, 5 moderate, 1 low), la mayoria en
`@babel/core`, `ajv`, `@humanfs/node` y `axios` de produccion.

## Solucion

- `npm audit fix` (sin `--force`) aplico patches/minor no breaking:
  de **26 -> 2** vulnerabilidades.
- Resto: solo `axios` anidado en `@inertiajs/inertia` — **sin fix
  publicado** (dependencia de un paquete externo; ya documentado como
  permanente).

## Archivos modificados

- `package-lock.json` (transitivos actualizados)

## Verificacion

- `npm audit` -> **2 high** (inertia/axios, no fix)
- `npm run lint` -> **0 errors** (330 warnings pre-existentes)
- `node --test tests/frontend/product-enquiry.test.mjs` -> **3 passed**
- `artisan test --compact` -> **129 passed** (694 assertions)

## Commit

`chore(deps): npm audit fix 26 a 2 vulnerabilidades (F4-57)`