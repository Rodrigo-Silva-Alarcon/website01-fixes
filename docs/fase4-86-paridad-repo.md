# F4-86 — Paridad de clone: base de datos versionada + README

## 1. Problema

Cualquier clone del repositorio no arrancaba en el mismo estado que la instancia de trabajo:

- `database/database.sqlite` estaba ignorada por `database/.gitignore` (`*.sqlite*`): un clone quedaba sin catálogo.
- Sin la BD, el paso de setup requería `touch database/database.sqlite` + `php artisan migrate --seed`, y el seed **no crea catálogo** (solo roles/permisos/usuarios/textos): el sitio quedaba vacío (0 productos, 0 categorías).
- El README no documentaba que la BD ya existe en la máquina de trabajo ni cómo reconstruirla si se pierde.

## 2. Cambios

| Archivo | Cambio |
|---|---|
| `database/.gitignore` | Excepción `!database.sqlite` tras `*.sqlite*` para que el archivo quede trackeable |
| `database/database.sqlite` | (nuevo en git) 744 KB con el estado baseline: 4 categorías, 16 subcategorías, 10 marcas, 18 productos, 18 inventarios, 3 banners, 2 pedidos, 20 carritos, 97 permisos, 8 textos, 3 usuarios (`admin`, `editor`, `viewer` con roles `editor_textos`/`viewer_textos`) |
| `README.md` | Paso3 de instalación simplificado (sin `touch`/`migrate` en el flujo normal); sección **"Base de datos incluida"** con los conteos, aviso de que `php artisan migrate:fresh --seed` **destruye el catálogo** y el comando de restauración (`git checkout -- database/database.sqlite`); fila en la tabla de troubleshooting |

## 3. Verificación

- `git status` muestra `?? database/database.sqlite` (antes invisible bajo `*.sqlite*`).
- `.env` contiene exactamente las claves de `.env.example` (sin secretos propios) — seguro para clone.
- `public/build` sigue fuera de git: el README documenta `npm run build` como paso post-instalación.
- Flujo de deploy (Docker/Render) intacto: `.dockerignore` excluye la BD de la imagen igual que antes.

## 4. Fuera de alcance

- Docker local sin probar (WSL2 no disponible en esta máquina); el flujo queda documentado en `docs/fase4-82-deploy-render.md`.
