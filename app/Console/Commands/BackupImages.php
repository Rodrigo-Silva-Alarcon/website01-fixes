<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;
use Illuminate\Support\Number;
use Throwable;

class BackupImages extends Command
{
    protected $signature = 'backup:images';

    protected $description = 'Guarda las imágenes subidas (public/data) en images.zip, reemplazando la copia anterior';

    public function handle(BackupService $backups): int
    {
        try {
            $backup = $backups->backupImages();
        } catch (Throwable $e) {
            report($e);
            $this->error('La copia de las imágenes falló: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->info("Copia de imágenes creada: {$backup['files']} archivos, ".Number::fileSize($backup['size'], 1).'.');

        return self::SUCCESS;
    }
}
