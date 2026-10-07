<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;
use Illuminate\Support\Number;
use Throwable;

class BackupDatabase extends Command
{
    protected $signature = 'backup:database {--label= : Etiqueta opcional para el nombre del archivo}';

    protected $description = 'Crea una copia verificada y comprimida de la base de datos y borra las que ya no hacen falta';

    public function handle(BackupService $backups): int
    {
        try {
            $backup = $backups->backupDatabase($this->option('label'));
        } catch (Throwable $e) {
            report($e);
            $this->error('La copia de la base de datos falló: '.$e->getMessage());

            return self::FAILURE;
        }

        $all = $backups->databaseBackups();
        $this->info("Copia creada: {$backup['name']} (".Number::fileSize($backup['size'], 1).')');
        $this->line(count($all).' copias guardadas, '.Number::fileSize(array_sum(array_column($all, 'size')), 1).' en total.');

        return self::SUCCESS;
    }
}
