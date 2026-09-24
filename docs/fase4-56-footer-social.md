# Fix - Iconos de redes sociales en footer (Fase 4)

## Problema

**§4.7.8:** el footer solo mostraba Facebook (condicional). No habia
iconos de Instagram ni Twitter/X aunque la empresa los use.

## Solucion

- `Footer.tsx`: nuevas claves CMS `footer_instagram` y `footer_twitter`
  con botones condicionales (mismo estilo que Facebook/WhatsApp).
- Iconos SVG inline (lucide-style stroke para Instagram, path X para
  Twitter) en blanco sobre boton naranja `#fa8232`.
- `CmsTextsTest`: claves y asserts de Instagram/Twitter añadidos.

## Claves CMS

| Clave | Ejemplo |
|---|---|
| `footer_instagram` | `https://instagram.com/smarthouse` |
| `footer_twitter` | `https://x.com/smarthouse` |

## Archivos modificados

- `resources/js/pages/web/components/Footer.tsx`
- `tests/Feature/CmsTextsTest.php`

## Verificacion

- `artisan test --compact --filter=CmsTextsTest` -> **4 passed** (72 assertions)
- `artisan test --compact` -> **129 passed** (694 assertions)
- lint -> **0 errors** (330 warnings pre-existentes)

## Commit

`feat(footer): iconos Instagram y X/Twitter en footer (F4-56)`