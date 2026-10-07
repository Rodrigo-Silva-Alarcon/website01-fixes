---
title: Website01 SmartHouse
emoji: 🏠
colorFrom: blue
colorTo: gray
sdk: docker
app_port: 10000
pinned: false
---

# Website01 — SmartHouse

Tienda/e-commerce con CMS administrativo: catálogo (categorías, subcategorías,
marcas, productos, inventarios), banners, textos configurables, carrito con
pedido por WhatsApp y RBAC (roles y permisos).

Fork de la prueba freelance **website01-fixes** — el historial de mejoras (F4-01…)
está en [`CHANGELOG.md`](CHANGELOG.md) y los informes en [`docs/`](docs/).

## Stack

- **Backend**: Laravel 12 (PHP ^8.2), Inertia.js, SQLite por defecto
  (MySQL/Redis documentados para producción en `.env.example`)
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui, Vite 7
- **Almacenamiento**: imágenes en `public/data/` (uploads + seeds)
- **Tests**: PHPUnit (137 tests, SQLite en memoria)

## Requisitos

- PHP ≥ 8.2 con extensiones: `pdo_sqlite`, `sqlite3`, `gd`, `mbstring`,
  `openssl`, `tokenizer`, `fileinfo`, `ctype`, `xml`, `curl`
- Composer 2
- Node.js ≥ 20 y npm

## Instalación local

```bash
# 1. Dependencias
composer install
npm install

# 2. Entorno
cp .env.example .env          # Windows: copy .env.example .env
php artisan key:generate

# 3. Base de datos: ya viene incluida
#    (database/database.sqlite con catálogo completo: no hace falta migrar)

# 4. Assets
npm run build                 # producción; o npm run dev (HMR en :5173)

# 5. Levantar
php artisan serve             # http://127.0.0.1:8000
```

En desarrollo puedes correr `npm run dev` y `php artisan serve` en paralelo
(este sirve la app, aquel los assets con hot-reload).

## Usuarios creados por el seed

El seed crea 3 usuarios con roles: **admin**, **editor_textos** y
**viewer_textos** (emails neutros `*@example.com`).

**No hay credenciales en el repositorio.** Para fijar la contraseña de los
usuarios que crea el seed, define una variable de entorno antes de sembrar:

```bash
SEED_PASSWORD=... php artisan db:seed
```

Si no se define, cada usuario nuevo recibe una contraseña aleatoria que puedes
restablecer con `php artisan tinker`. Panel: `/login` → `/admin/dashboard`.

## Base de datos incluida

`database/database.sqlite` viene en el repo con el estado real del proyecto:
3 usuarios con roles, **97 permisos**, 4 categorías, 16 subcategorías, 10 marcas,
**18 productos** con inventario, 3 banners y 8 textos del CMS. Un clone seguido
de la instalación anterior queda idéntico (catálogo, contenido y usuarios).

> ⚠️ **Si ejecutas `php artisan migrate:fresh --seed`** (o borras la BD), la
> semilla deja usuarios, roles y permisos (60) pero **0 catálogo**: los seeders
> `SubcategorySeeder`/`ProductSeeder` solo rellenan si las categorías ya
> existen (ningún seeder las crea). En ese caso:
>
> 1. **Restaurar la BD incluida**: `git checkout -- database/database.sqlite`
> 2. **Crear todo desde el CMS**: `/login` → Categorías → Marcas →
>    Subcategorías → Productos → **Inventarios** (un producto sin inventario no
>    muestra precio/stock; el CRUD de inventarios solo ofrece productos sin
>    inventario).
> 3. **Semilla mínima manual**: crear las categorías `Electrodomesticos`,
>    `Cocina`, `Equipos-de-sonido`, `Consolas` (slugs exactos) y re-ejecutar
>    `php artisan db:seed` — los seeders rellenarán subcategorías y productos.

## Comandos útiles

```bash
npm run dev        # Vite dev server (HMR)
npm run build      # build de producción → public/build
npm run lint       # ESLint --fix (baseline: 0 errores / 215 warnings)
php artisan test   # 137 tests (SQLite en memoria, no toca tu BD)
php artisan migrate --seed
php artisan config:cache   # producción (no hay env() fuera de config/)
```

## Estructura

```
app/Http/Controllers/
├── WebController.php          # storefront (home, productos, contacto)
├── ShopController.php         # carrito (añadir, cantidades, quitar)
└── Admin/                     # CMS (CRUDs, dashboard, settings)
resources/js/pages/
├── web/                       # storefront (Inertia)
└── admin/                     # panel administrativo
routes/       web.php (tienda + admin), auth.php, settings.php
database/     migrations, seeders y SQLite incluida (catálogo completo)
public/data/  imágenes subidas y de seed (products/, categories/, …)
deploy/       entrypoint.sh, nginx.conf, supervisord.conf (Render/Docker)
docs/         informes por fase (fase4-*.md) y guías
```

## Configuración (`.env`)

Claves relevantes (ver `.env.example` para el listado completo):

| Variable | Valor por defecto | Notas |
|---|---|---|
| `APP_URL` | `http://localhost` | producción: dominio real |
| `APP_LOCALE` | `es` | validaciones y auth en español |
| `DB_CONNECTION` | `sqlite` | variantes MySQL/Redis comentadas en el ejemplo |
| `SESSION_DRIVER` / `CACHE_STORE` / `QUEUE_CONNECTION` | `database` | tablas incluidas en las migraciones |
| `MAIL_MAILER` | `log` | formulario de contacto escribe en `storage/logs` |
| `CONTACT_EMAIL` | `hello@example.com` | destino del formulario de contacto |

## Tests

```bash
php artisan test
```

137 tests / 731 aserciones. Corren sobre SQLite en memoria (`phpunit.xml`);
no modifican `database/database.sqlite`.

## Deploy (Render + Docker)

Artefactos: `Dockerfile` (multi-stage: assets → composer → php8.3-fpm con
nginx + supervisord), `render.yaml` (Starter, disco 1 GB montado en
`/persist`), `deploy/` (entrypoint con uploads persistentes via symlink,
migrate condicional y cache). Guía paso a paso:
[`docs/fase4-82-deploy-render.md`](docs/fase4-82-deploy-render.md).

Puntos clave de producción:

- Subir la BD real al disco de Render (`/persist/database.sqlite`) — un
  deploy recién `migrate --seed` queda sin catálogo (ver arriba).
- Los uploads viven en `public/data/`; el entrypoint los enlaza a
  `/persist/data` para que sobrevivan a los deploys.
- Configurar `APP_KEY`, `SESSION_SECURE_COOKIE=true`, SMTP y
  `php artisan config:cache` (el `.env.example` trae las variantes comentadas).

## Solución de problemas

| Síntoma | Causa / solución |
|---|---|
| `database/database.sqlite` no existe (BD borrada) | `git checkout -- database/database.sqlite` o clonar de nuevo |
| Mensajes de validación en inglés | `APP_LOCALE` no está en `es` en `.env` |
| Subida WebP falla en local | El GD local no tiene libwebp: usa PNG/JPG (la app lo traduce a un mensaje amigable); en producción con GD+webp funciona |
| Assets desactualizados tras un `git pull` | Ejecutar `npm run build` (o `npm run dev` en desarrollo) |
| Página en blanco en desarrollo | Mirar `storage/logs/laravel.log`; ¿`npm run dev` corriendo? |
| 403 en rutas `/admin/*` | RBAC: el usuario no tiene el permiso (roles en `/admin/roles`) |

## Documentación relacionada

- [`CHANGELOG.md`](CHANGELOG.md) — todos los cambios del fork
- [`docs/fase4-82-deploy-render.md`](docs/fase4-82-deploy-render.md) — guía de deploy
- [`docs/fase4-83-qa-usuario-e2e.md`](docs/fase4-83-qa-usuario-e2e.md) — QA como usuario (E2E)
- [`docs/fase4-84-categorias-tint.md`](docs/fase4-84-categorias-tint.md) — fix de imágenes en Categorías
