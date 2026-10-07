<?php

namespace Database\Seeders;

use App\Helpers\PermissionHelper;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SectorPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Definir sectores y sus permisos adicionales
        $sectores = [
            'products' => [
                'sector_name' => 'productos',
                'additional_permissions' => [],
            ],
            'categories' => [
                'sector_name' => 'categorías',
                'additional_permissions' => [],
            ],
            'subcategories' => [
                'sector_name' => 'subcategorías',
                'additional_permissions' => [],
            ],
            'brands' => [
                'sector_name' => 'marcas',
                'additional_permissions' => [],
            ],
            'banners' => [
                'sector_name' => 'banners',
                'additional_permissions' => [],
            ],
            'inventories' => [
                'sector_name' => 'inventarios',
                'additional_permissions' => [],
            ],
        ];

        // Crear permisos para cada sector
        foreach ($sectores as $sector => $config) {
            $this->command->info("Creando permisos para el sector: {$sector}");
            
            PermissionHelper::createSectorPermissions(
                $sector,
                $config['sector_name'],
                $config['additional_permissions']
            );
        }

        $this->command->info('✅ Todos los permisos de sectores creados exitosamente!');
    }
}
