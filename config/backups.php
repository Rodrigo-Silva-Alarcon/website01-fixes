<?php

/*
 * Copias de seguridad automáticas (base de datos + imágenes subidas).
 *
 * Retención "abuelo-padre-hijo": muchas copias recientes y cada vez menos
 * a medida que envejecen, así el espacio usado se mantiene casi fijo.
 */
return [

    // Carpeta donde se guardan las copias (no es accesible desde la web).
    'path' => env('BACKUP_PATH', storage_path('app/private/backups')),

    // Carpeta de imágenes subidas desde el panel que también se respalda.
    'images_path' => public_path('data'),

    'retention' => [
        // Todas las copias de las últimas N horas.
        'keep_all_hours' => (int) env('BACKUP_KEEP_ALL_HOURS', 48),
        // Después, una por día durante N días.
        'keep_daily_days' => (int) env('BACKUP_KEEP_DAILY_DAYS', 14),
        // Después, una por semana durante N semanas.
        'keep_weekly_weeks' => (int) env('BACKUP_KEEP_WEEKLY_WEEKS', 8),
        // Después, una por mes durante N meses.
        'keep_monthly_months' => (int) env('BACKUP_KEEP_MONTHLY_MONTHS', 12),
    ],

    // Tope de espacio para las copias de la base de datos. Si se supera se borran
    // las más antiguas, pero nunca la más reciente.
    'max_size_mb' => (int) env('BACKUP_MAX_SIZE_MB', 2048),

    // Si se define, se envía un correo cuando una copia programada falla.
    'notify_email' => env('BACKUP_NOTIFY_EMAIL'),
];
