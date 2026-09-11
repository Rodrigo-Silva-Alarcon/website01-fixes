<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear roles básicos del sistema
        $roles = [
            [
                'name' => 'admin',
                'description' => 'Administrador del sistema con acceso completo a todas las funcionalidades',
            ],
            [
                'name' => 'editor_textos',
                'description' => 'Editor especializado en gestión de textos con permisos completos sobre textos',
            ],
            [
                'name' => 'viewer_textos',
                'description' => 'Visualizador con acceso de solo lectura a textos',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}
