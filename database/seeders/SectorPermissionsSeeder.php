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
            'productos' => [
                'sector_name' => 'productos',
                'additional_permissions' => [
                    'manage_stock_productos' => 'Gestionar stock de productos',
                    'categorize_productos' => 'Categorizar productos',
                ]
            ],
            'ventas' => [
                'sector_name' => 'ventas',
                'additional_permissions' => [
                    'approve_ventas' => 'Aprobar ventas',
                    'cancel_ventas' => 'Cancelar ventas',
                    'export_ventas' => 'Exportar ventas',
                ]
            ],
            'inventario' => [
                'sector_name' => 'inventario',
                'additional_permissions' => [
                    'adjust_inventario' => 'Ajustar inventario',
                    'transfer_inventario' => 'Transferir inventario',
                    'audit_inventario' => 'Auditar inventario',
                ]
            ],
            'clientes' => [
                'sector_name' => 'clientes',
                'additional_permissions' => [
                    'export_clientes' => 'Exportar clientes',
                    'import_clientes' => 'Importar clientes',
                ]
            ],
            'proveedores' => [
                'sector_name' => 'proveedores',
                'additional_permissions' => [
                    'evaluate_proveedores' => 'Evaluar proveedores',
                    'manage_contracts_proveedores' => 'Gestionar contratos de proveedores',
                ]
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
