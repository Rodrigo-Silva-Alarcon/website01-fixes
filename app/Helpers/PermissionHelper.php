<?php

namespace App\Helpers;

use App\Models\Permission;

class PermissionHelper
{
    /**
     * Generar permisos para un sector específico
     */
    public static function generateSectorPermissions(string $sector, string $sectorName): array
    {
        return [
            [
                'name' => "view_{$sector}",
                'description' => "Ver lista de {$sectorName}",
                'sector' => $sector,
            ],
            [
                'name' => "create_{$sector}",
                'description' => "Crear nuevos {$sectorName}",
                'sector' => $sector,
            ],
            [
                'name' => "edit_{$sector}",
                'description' => "Editar {$sectorName} existentes",
                'sector' => $sector,
            ],
            [
                'name' => "delete_{$sector}",
                'description' => "Eliminar {$sectorName}",
                'sector' => $sector,
            ],
            [
                'name' => "show_{$sector}",
                'description' => "Ver detalles de un {$sectorName}",
                'sector' => $sector,
            ],
        ];
    }

    /**
     * Generar permisos adicionales para un sector
     */
    public static function generateAdditionalPermissions(string $sector, string $sectorName, array $additionalActions = []): array
    {
        $permissions = [];
        
        foreach ($additionalActions as $action => $description) {
            // Si el action ya contiene el sector, no lo agregamos de nuevo
            $permissionName = str_contains($action, $sector) ? $action : "{$action}_{$sector}";
            
            $permissions[] = [
                'name' => $permissionName,
                'description' => $description,
                'sector' => $sector,
            ];
        }
        
        return $permissions;
    }

    /**
     * Crear todos los permisos para un sector
     */
    public static function createSectorPermissions(string $sector, string $sectorName, array $additionalActions = []): void
    {
        $basicPermissions = self::generateSectorPermissions($sector, $sectorName);
        $additionalPermissions = self::generateAdditionalPermissions($sector, $sectorName, $additionalActions);
        
        $allPermissions = array_merge($basicPermissions, $additionalPermissions);
        
        foreach ($allPermissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }
    }
}
