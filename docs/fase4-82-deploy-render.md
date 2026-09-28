# F4-82 — Informe de deploy: Render + Docker (SQLite sin cambiar arquitectura)

## Objetivo

Poner el sitio en una **URL pública** para medir **PageSpeed Insights** y
completar la prueba, sin migrar de motor de BD ni tocar arquitectura:
**Laravel 12 + Inertia + SQLite** tal como está.

## Decisión de plataforma

| Opción | Veredicto |
|---|---|
| **Render (Starter $7/mes + disco persistente ≈ $1)** — runtime Docker | ✅ elegido: soporta disco persistente (SQLite + uploads), `render.yaml` como blueprint, build automático desde GitHub |
| Render Free | ❌ sin disco persistente → la BD/Uploads se pierden en cada deploy y el dyno duerme |
| Railway / Fly.io | ❌ sin ventaja para esta prueba y requieren migrar config |
| Subir a la VPS/original del cliente | ❌ fuera del alcance (no es nuestra instancia) |

## Artefactos agregados (sin tocar código de la app)

| Archivo | Rol |
|---|---|
| `Dockerfile` | multi-stage: `node:20-alpine` (npm ci + vite build) → `composer:2` (vendor `--no-dev`) → `php:8.3-fpm-bookworm` + **nginx + supervisord**; GD compilado con **WebP/JPEG/FreeType** (produce lo que el GD local no puede) |
| `deploy/nginx.conf` | sirve `/var/www/public`, `try_files` → Front Controller, **gzip**, caché 7d para estáticos, `fastcgi_pass 127.0.0.1:9000`, `listen {{PORT}}` (Render asigna el puerto) |
| `deploy/supervisord.conf` | un solo proceso PID1 levanta `php-fpm` + `nginx` (Render no orquesta varios procesos) |
| `deploy/entrypoint.sh` | (1) symlink `public/data` → `/persist/data` (**uploads persistentes**), (2) `migrate --force` + `db:seed` solo si la BD está recién creada, (3) `config:cache` + `view:cache`, (4) inyecta `$PORT` en nginx y ejecuta supervisord |
| `render.yaml` | blueprint: plan Starter, disco `website01-data` → `/persist` (1 GB), env vars (`APP_KEY` autogenerado, `APP_ENV=production`, `APP_DEBUG=false`, SQLite en `/persist/database.sqlite`, session/cache/queue en BD) |
| `.dockerignore` | excluye `.git`, `node_modules`, logs, **`database/*.sqlite` (la BD nunca viaja en la imagen)** y `.env` |

## Flujo de deploy

1. **Push del fork** a GitHub (cuando el usuario lo autorice — nada está
   commiteado aún).
2. Render → **New → Blueprint** (lee `render.yaml`) o New → Web Service
   apuntando al repo; el build ejecuta el `Dockerfile`.
3. El primer arranque crea `/persist/database.sqlite` vacío, migra y hace
   seed (**solo 3 usuarios** — ver "BD actual" abajo).
4. **Subir la BD actual**: Dashboard → servicio → **Disks → File Browser** →
   subir `database/database.sqlite` (744 KB, la de pruebas con 18 productos)
   a `/persist/database.sqlite` → **Restart deploy**.
5. Verificar: `/`, `/productos`, `/admin` (login `mjuchani@megalink.com` /
   `moi123`), imágenes de `public/data`.
6. PageSpeed Insights sobre `https://<tu-app>.onrender.com`.

### BD actual vs. seed

- **Recomendado (la BD actual, como pide el encargo)**: subir el archivo
  `database/database.sqlite` al disco. Contiene el contenido completo
  (marcas, categorías,18 productos, banners, textos, roles).
- **`db:seed` solo NO alcanza**: verificado en BD fresca → crea **0
  categorías /0 marcas /0 productos** (los seeders referencian
  categorías/marcas que nadie crea; `ProductSeeder` las salta). Gap
  documentado, fuera de alcance arquitectónico; si se quiere un sitio
  "seedable" habría que agregar un `BrandCategorySeeder`.

## PageSpeed: análisis y recomendaciones

Hallazgo principal del build local: **un solo chunk de vendor de ~982 kB**
(`vendor-BkRrpIFw.js` — React + Inertia + axios + Ziggy + QR + date libs) que
dispara el ahorro de tiempo de parseo (TBT/INP). Recomendaciones ordenadas
por impacto/esfuerzo:

1. **`manualChunks` en `vite.config`** (impacto alto, esfuerzo bajo): separar
   `react`/`react-dom`/`@inertiajs` de utilidades (`dayjs`, QR) para que el
   navegador cancele/parsee por ruta.
2. **Caché estática + gzip**: ya resuelto en `deploy/nginx.conf`
   (`expires7d immutable` + `gzip`).
3. **Imágenes**: el sitio ya sirve variantes `.webp` y `loading="lazy"` en
   cards; verificar en el informe que LCP sea la imagen del hero con
   `fetchpriority="high"`.
4. **Preload de fuentes / `preconnect`** si el informe marca FCP por tipografía.
5. El dyno Starter es de **un solo thread de build**; el runtime con
   nginx+fpm es suficiente para QA, no para tráfico real.

## Verificación de los artefactos

| Qué | Resultado |
|---|---|
| `sh -n deploy/entrypoint.sh` (Git Bash) | ✅ sintaxis OK |
| `yaml.safe_load(render.yaml)` | ✅ |
| `configparser` sobre `supervisord.conf` | ✅ secciones `program:php-fpm` / `program:nginx` |
| Rutas `COPY` del Dockerfile existen | ✅ |
| **`docker build` local** | ⚠️ **no ejecutable en esta máquina**: Docker Desktop requiere WSL2 y el subsistema no está instalado (requiere `wsl --install` + reinicio). **El build real ocurre en Render**; si falla, el log apunta a la línea exacta |
| `migrate` + `db:seed` en BD fresca | ✅ corre end-to-end (contenido parcial, ver arriba) |

## Limitaciones conocidas (aceptadas para la prueba)

- **Una sola instancia**: `SESSION/CACHE/QUEUE` en BD (SQLite no admite
  varios writers) — correcto para QA.
- `php artisan serve` **no** se usa: fpm+nginx es el camino correcto.
- La imagen no incluye `.env` ni la BD (`.dockerignore`): toda la config
  pasa por env vars y la data vive en el disco.
- Si Render free-tier app duerme (si se baja de plan), la URL tarda ~30 s en
  despertar y PageSpeed puede medir ese cold start.
