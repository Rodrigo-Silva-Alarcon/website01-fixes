<?php

namespace App\Console\Commands;

use App\Helpers\PermissionHelper;
use Illuminate\Console\Command;

class SetupSectorCommand extends Command
{
    protected $signature = 'sector:setup {sector} {--config}';
    protected $description = 'Configurar completamente un nuevo sector';

    public function handle()
    {
        $sector = $this->argument('sector');
        $useConfig = $this->option('config');

        if ($useConfig) {
            $this->setupFromConfig($sector);
        } else {
            $this->setupManually($sector);
        }
    }

    private function setupFromConfig(string $sector): void
    {
        $config = config("sectores.sectores.{$sector}");
        
        if (!$config) {
            $this->error("El sector '{$sector}' no está definido en config/sectores.php");
            return;
        }

        $this->info("Configurando sector: {$sector} desde configuración");

        // Crear permisos
        PermissionHelper::createSectorPermissions(
            $sector,
            $config['nombre'],
            $config['permisos_adicionales']
        );

        $this->info("✅ Permisos creados para {$sector}");
        $this->showNextSteps($sector, $config);
    }

    private function setupManually(string $sector): void
    {
        $this->info("Configurando sector: {$sector} manualmente");
        
        // Solicitar información
        $sectorName = $this->ask("Nombre del sector (ej: productos)", $sector);
        $additionalPermissions = $this->askForAdditionalPermissions();

        // Crear permisos
        PermissionHelper::createSectorPermissions(
            $sector,
            $sectorName,
            $additionalPermissions
        );

        $this->info("✅ Permisos creados para {$sector}");
        $this->showNextSteps($sector, [
            'nombre' => $sectorName,
            'permisos_adicionales' => $additionalPermissions,
            'icono' => 'Package', // Default
            'ruta' => "/admin/{$sector}",
            'permiso_vista' => "view_{$sector}",
        ]);
    }

    private function askForAdditionalPermissions(): array
    {
        $permissions = [];
        
        $this->info("Permisos adicionales (deja vacío para terminar):");
        
        while (true) {
            $permission = $this->ask("Nombre del permiso adicional (ej: approve_ventas)");
            if (empty($permission)) {
                break;
            }
            
            $description = $this->ask("Descripción del permiso");
            $permissions[$permission] = $description;
        }
        
        return $permissions;
    }

    private function showNextSteps(string $sector, array $config): void
    {
        $this->line("\n📝 Próximos pasos:");
        $this->line("1. Agregar al sidebar:");
        $this->line("   - Importar icono: {$config['icono']}");
        $this->line("   - Agregar elemento con permission: {$config['permiso_vista']}");
        
        $this->line("\n2. Crear rutas en web.php:");
        $this->line("   Route::resource('/{$sector}', {$this->getControllerName($sector)}::class)->names('admin.{$sector}');");
        
        $this->line("\n3. Crear controlador:");
        $this->line("   php artisan make:controller Admin/{$this->getControllerName($sector)} --resource");
        
        $this->line("\n4. Crear vistas en:");
        $this->line("   resources/js/pages/admin/{$sector}/");
        
        $this->line("\n5. Asignar permisos a roles según corresponda");
        
        $this->line("\n6. Agregar a config/sectores.php si usas configuración");
    }

    private function getControllerName(string $sector): string
    {
        return ucfirst(str_singular($sector)) . 'Controller';
    }
}
