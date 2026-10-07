<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Inertia\Ssr\BundleDetector;

/**
 * Mantiene encendido el servidor SSR de Inertia en hostings sin supervisor (Plesk).
 * Lo lanza el programador cada 5 minutos: si está apagado lo arranca en segundo plano,
 * y si el bundle cambió (nuevo `npm run build:ssr`) lo reinicia para usar el código nuevo.
 */
class EnsureSsr extends Command
{
    protected $signature = 'ssr:ensure';

    protected $description = 'Start the Inertia SSR server in the background if it is not running';

    public function handle(): int
    {
        $bundle = (new BundleDetector)->detect();

        if ($bundle === null) {
            $this->error('SSR bundle not found. Run `npm run build:ssr` first.');

            return self::FAILURE;
        }

        $marker = storage_path('framework/ssr-bundle-mtime');
        $bundleVersion = (string) filemtime($bundle);
        $running = Artisan::call('inertia:check-ssr') === self::SUCCESS;

        if ($running && @file_get_contents($marker) === $bundleVersion) {
            $this->info('SSR server is running.');

            return self::SUCCESS;
        }

        if ($running) {
            Artisan::call('inertia:stop-ssr');
            sleep(1);
        }

        exec(sprintf(
            'nohup %s %s > %s 2>&1 &',
            escapeshellarg(config('inertia.ssr.node_binary')),
            escapeshellarg($bundle),
            escapeshellarg(storage_path('logs/ssr.log')),
        ));
        file_put_contents($marker, $bundleVersion);

        $this->info($running ? 'SSR server restarted with the new bundle.' : 'SSR server started.');

        return self::SUCCESS;
    }
}
