#!/bin/sh
set -e
cd /var/www

PORT="${PORT:-10000}"

mkdir -p /persist/data \
    storage/framework/cache storage/framework/sessions storage/framework/views \
    storage/logs bootstrap/cache

DB="${DB_DATABASE:-/persist/database.sqlite}"

# Solo se enlazan los uploads al disco persistente si existe (plan con disco);
# en plan free se conservan las imagenes que vienen en el repo.
case "$DB" in
    /persist/*)
        if [ ! -L public/data ]; then
            rm -rf public/data
            ln -sfn /persist/data public/data
        fi
        ;;
esac

FRESH=0
if [ ! -f "$DB" ]; then
    touch "$DB"
    FRESH=1
fi

# SQLite necesita escribir tambien en la carpeta (journal/wal), no solo en el archivo
chown -R www-data:www-data "$(dirname "$DB")" 2>/dev/null || true
chown -R www-data:www-data public/data 2>/dev/null || true
chown -R www-data:www-data /persist 2>/dev/null || true
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

php artisan migrate --force --no-interaction
if [ "$FRESH" = "1" ]; then
    php artisan db:seed --force --no-interaction || echo "[entrypoint] seed omitido"
fi

php artisan config:cache --no-interaction || true
php artisan view:cache --no-interaction || true

sed -i "s/{{PORT}}/${PORT}/g" /etc/nginx/sites-available/default

exec supervisord -c /etc/supervisord.conf
