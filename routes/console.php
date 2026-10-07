<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('carts:prune')->daily();

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
