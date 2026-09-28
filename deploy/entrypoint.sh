#!/bin/sh
set -e
cd /var/www

PORT="${PORT:-10000}"

mkdir -p /persist/data \
    storage/framework/cache storage/framework/sessions storage/framework/views \
    storage/logs bootstrap/cache

if [ ! -L public/data ]; then
    rm -rf public/data
    ln -sfn /persist/data public/data
fi

DB="${DB_DATABASE:-/persist/database.sqlite}"
FRESH=0
if [ ! -f "$DB" ]; then
    touch "$DB"
    FRESH=1
fi

chown www-data:www-data "$DB" 2>/dev/null || true
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
