<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('carts:prune')->daily();

// Hostings sin supervisor (Plesk): enciende el servidor SSR si se cayó o si hay un build nuevo.
// En Docker no se activa: ahí lo mantiene supervisord (deploy/supervisord.conf).
if (config('inertia.ssr.enabled') && config('inertia.ssr.autostart')) {
    Schedule::command('ssr:ensure')->everyFiveMinutes()->withoutOverlapping();
}

// Copias de seguridad (config/backups.php). La retención se aplica después de cada copia.
$backupJobs = [
    Schedule::command('backup:database')->everySixHours()->withoutOverlapping(),
    Schedule::command('backup:images')->dailyAt('03:30')->withoutOverlapping(),
];

if ($notify = config('backups.notify_email')) {
    foreach ($backupJobs as $job) {
        $job->emailOutputOnFailure($notify);
    }
}
