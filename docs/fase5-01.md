Quiero una REVISIÓN TOTAL del CMS de la web SmartHouse (Laravel + Inertia + React + SSR).
Trabaja en dos fases. En la Fase 1 NO modifiques código; solo audita y entrega un informe y un plan.
Empieza la Fase 2 únicamente cuando yo apruebe el plan.

Antes de empezar, carga la skill `rendimiento-web`. Cualquier corrección debe respetar sus reglas
de rendimiento móvil (props de Inertia ligeras, imágenes, fuentes, chunks).

## Contexto de cómo funciona el CMS hoy
- Panel admin → base de datos → `app/Services/WebContentService.php` (con caché y `flushCache()`)
  → compartido por `HandleInertiaRequests` como `cmsTexts` y `contact` → `useCms()` en
  `resources/js/lib/cms.ts` → componentes de `resources/js/pages/web/**`.
- Modelos relacionados: Text, ContactSetting, FooterSetting, Banner, HomeSection, AboutPage,
  AboutImage, Brand, Category, Subcategory, Product, Inventory.
- Test existente: `tests/Feature/CmsTextsTest.php`.

## FASE 1: AUDITORÍA (solo lectura)

### 1. Inventario del CMS (lo que existe en el panel)
- Lista cada apartado del panel admin (`resources/js/pages/admin/**`, controladores, rutas
  `routes/web.php`): qué campos edita, a qué modelo/tabla escribe y a qué página pública afecta.
- Lista todas las claves de la tabla Text (migraciones, seeders y `cmsTexts`) y quién las consume.

### 2. Inventario de la web pública (lo que se muestra)
- Recorre CADA página y componente de `resources/js/pages/web/**`
  (Home, Productos, ProductDetail, About, Contacto, Carrito, Checkout, CheckoutSuccess, Footer,
  Header/menú, CartDrawer, FeaturesBar, ShowroomSection, imports/Info, etc.).
- Para cada uno, clasifica cada texto, imagen, enlace, número, horario, título, botón y mensaje en:
  A) Viene del CMS correctamente (con fallback razonable).
  B) Viene del CMS pero con problemas (clave inexistente, fallback que oculta un fallo,
     se muestra HTML crudo, no se refleja tras editar, etc.).
  C) HARDCODEADO: está escrito en el código y debería ser editable.
  D) Hardcodeado pero justificable (textos de UI técnicos, errores de validación, etc.).
  Para C y D, explica por qué.

### 3. Cruce panel ↔ web
- Campos del panel que NO se usan en ninguna parte de la web (huérfanos).
- Contenido de la web que NO tiene campo en el panel (falta apartado admin).
- Claves referenciadas en el frontend que no existen en BD/seeders/migraciones.
- Claves duplicadas o con nombres inconsistentes. Datos con dos fuentes de verdad
  (por ejemplo WhatsApp: ContactSetting vs Text `footer_whatsapp`).

### 4. Verificación de caché y flujo de guardado
- Revisa que cada modelo editable desde el panel invalide la caché al guardar, actualizar,
  eliminar y reordenar. Compara las claves de caché usadas en WebContentService con las de
  `flushCache()` y reporta las que falten.
- Comprueba que guardar en el panel se refleje al instante en la web pública.
- Revisa el comportamiento con contenido despublicado/inactivo y con contenido vacío:
  que la web no quede rota ni vacía.

### 5. Robustez y seguridad
- Sanitización del HTML del editor enriquecido (riesgo XSS) y cómo se renderiza en el frontend.
- Validación en los controladores del admin (longitudes, URLs, números, imágenes).
- Permisos: que las rutas del admin estén protegidas por auth/rol.
- Subida de imágenes: formatos, tamaño, thumbs, rutas, y que se sirvan optimizadas.

### 6. Rendimiento (según la skill rendimiento-web)
- Peso de los props de Inertia que comparte el CMS en cada página.
- Número de consultas por request y uso de caché.
- Imágenes del CMS: dimensiones, lazy loading, formato.

### 7. Pruebas reales (ejecútalas, no solo leas código)
- Corre los tests existentes (`php artisan test`) y reporta el resultado exacto.
- Levanta el proyecto con las herramientas de preview, entra al panel, edita un valor de cada
  apartado y confirma que cambia en la web pública. Revisa consola y logs.
- Prueba en vista móvil y escritorio.

### Entregable de la Fase 1
Un informe con estas secciones:
1. Resumen ejecutivo (estado general del CMS y % aproximado de la web gestionada por CMS).
2. Tabla de cobertura: página/componente | elemento | estado (A/B/C/D) | archivo:línea | acción propuesta.
3. Lista de apartados del panel huérfanos o rotos.
4. Lista de hallazgos por severidad (Crítico / Alto / Medio / Bajo), con evidencia (archivo:línea).
5. PLAN DE CORRECCIÓN por fases, con: tareas concretas, archivos a tocar, migraciones/seeders
   necesarios (con valores por defecto iguales al texto actual para no cambiar lo que ve el cliente),
   campos nuevos del panel, tests a agregar, riesgos y orden recomendado.
   Divídelo en lotes pequeños y probables de forma independiente (un lote por página o por apartado).
6. Preguntas o decisiones que necesiten mi respuesta.

Termina la Fase 1 y espera mi aprobación. No edites ni borres nada.

## FASE 2: CORRECCIÓN (solo tras mi aprobación)
- Trabaja lote por lote, en el orden del plan, y no avances al siguiente sin verificar el actual.
- Cada texto que pase a CMS debe: tener su clave en migración/seeder con el valor actual como
  default, leerse con `useCms()` y fallback, y invalidar la caché en `flushCache()`.
- Cada contenido nuevo editable debe tener su formulario en el panel con validación.
- No cambies el diseño ni el contenido visible, salvo que el plan lo indique.
- Agrega o actualiza tests (por ejemplo ampliando `CmsTextsTest.php`).
- Después de cada lote: tests, prueba en navegador (panel → web), consola sin errores,
  y reporte de qué se cambió.
- Haz commits pequeños por lote con mensajes claros. No hagas push sin que yo lo pida.
- Al final: reporte comparativo antes/después de la cobertura del CMS y checklist de pruebas manuales
  para mi colega.

Reglas generales:
- Si algo es ambiguo, pregúntame en vez de suponer.
- Reporta con honestidad lo que falle o no hayas podido verificar.
- Responde en español.
