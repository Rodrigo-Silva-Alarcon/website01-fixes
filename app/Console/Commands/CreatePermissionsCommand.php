<?php

namespace App\Console\Commands;

use App\Helpers\PermissionHelper;
use Illuminate\Console\Command;

class CreatePermissionsCommand extends Command
{
    protected $signature = 'permissions:create {sector} {sector_name} {--additional=}';
    protected $description = 'Crear permisos para un nuevo sector';

    public function handle()
    {
        $sector = $this->argument('sector');
        $sectorName = $this->argument('sector_name');
        $additional = $this->option('additional');

        $additionalActions = [];
        if ($additional) {
            $additionalActions = json_decode($additional, true) ?? [];
        }

        $this->info("Creando permisos para el sector: {$sector} ({$sectorName})");

        PermissionHelper::createSectorPermissions($sector, $sectorName, $additionalActions);

        $this->info("✅ Permisos creados exitosamente!");
        $this->line("Permisos básicos:");
        $this->line("- view_{$sector}");
        $this->line("- create_{$sector}");
        $this->line("- edit_{$sector}");
        $this->line("- delete_{$sector}");
        $this->line("- view_{$sector}_item");

        if (!empty($additionalActions)) {
            $this->line("Permisos adicionales:");
            foreach ($additionalActions as $action => $description) {
                $this->line("- {$action}_{$sector}");
            }
        }

        $this->line("\n📝 Próximos pasos:");
        $this->line("1. Agregar el elemento al AppSidebar");
        $this->line("2. Crear las rutas en web.php");
        $this->line("3. Crear el controlador y vistas");
        $this->line("4. Asignar permisos a roles según corresponda");
    }
}
