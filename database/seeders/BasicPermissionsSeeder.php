<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BasicPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear algunos permisos básicos de ejemplo
        $basicPermissions = [
            ['name' => 'view-users', 'description' => 'Ver usuarios', 'sector' => 'usuarios'],
            ['name' => 'create-users', 'description' => 'Crear usuarios', 'sector' => 'usuarios'],
            ['name' => 'edit-users', 'description' => 'Editar usuarios', 'sector' => 'usuarios'],
            ['name' => 'delete-users', 'description' => 'Eliminar usuarios', 'sector' => 'usuarios'],
            ['name' => 'view-roles', 'description' => 'Ver roles', 'sector' => 'roles'],
            ['name' => 'create-roles', 'description' => 'Crear roles', 'sector' => 'roles'],
            ['name' => 'edit-roles', 'description' => 'Editar roles', 'sector' => 'roles'],
            ['name' => 'delete-roles', 'description' => 'Eliminar roles', 'sector' => 'roles'],
            ['name' => 'view-permissions', 'description' => 'Ver permisos', 'sector' => 'permisos'],
            ['name' => 'create-permissions', 'description' => 'Crear permisos', 'sector' => 'permisos'],
            ['name' => 'edit-permissions', 'description' => 'Editar permisos', 'sector' => 'permisos'],
            ['name' => 'delete-permissions', 'description' => 'Eliminar permisos', 'sector' => 'permisos'],
            ['name' => 'access-dashboard', 'description' => 'Acceder al dashboard', 'sector' => 'general'],
            ['name' => 'view-profile', 'description' => 'Ver perfil', 'sector' => 'general'],
            ['name' => 'edit-profile', 'description' => 'Editar perfil', 'sector' => 'general'],
        ];

        foreach ($basicPermissions as $permissionData) {
            Permission::updateOrCreate(
                ['name' => $permissionData['name']],
                $permissionData
            );
        }
        
        $this->command->info('Permisos básicos creados exitosamente.');
    }
}