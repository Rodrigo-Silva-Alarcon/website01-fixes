<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;
use Illuminate\Support\Number;
use Throwable;

class BackupRestore extends Command
{
    protected $signature = 'backup:restore
        {name? : Archivo de la copia (sin nombre muestra la lista)}
        {--force : No pedir confirmación}';

    protected $description = 'Restaura la base de datos desde una copia (antes guarda una copia del estado actual)';

    public function handle(BackupService $backups): int
    {
        $list = $backups->databaseBackups();
        if ($list === []) {
            $this->warn('No hay copias guardadas en '.$backups->path());

            return self::FAILURE;
        }

        $name = $this->argument('name');
        if ($name === null) {
            $this->table(['Archivo', 'Fecha', 'Tamaño'], array_map(fn ($b) => [
                $b['name'],
                $b['created_at']->format('d/m/Y H:i'),
                Number::fileSize($b['size'], 1),
            ], $list));
            $this->line('Uso: php artisan backup:restore <archivo>');

            return self::SUCCESS;
        }

        if (! $this->option('force') && ! $this->confirm("Se reemplazará la base de datos actual por {$name}. ¿Continuar?")) {
            return self::FAILURE;
        }

        // Modo mantenimiento para que nadie escriba mientras se reemplaza el archivo.
        $this->callSilently('down', ['--retry' => 15]);
        try {
            $safety = $backups->restoreDatabase($name);
        } catch (Throwable $e) {
            report($e);
            $this->error('No se restauró nada: '.$e->getMessage());

            return self::FAILURE;
        } finally {
            $this->callSilently('up');
        }

        $this->info("Base de datos restaurada desde {$name}.");
        $this->line("El estado anterior quedó guardado en {$safety} por si necesitas deshacerlo.");

        return self::SUCCESS;
    }
}
