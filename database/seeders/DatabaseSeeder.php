<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Ejecutar seeders en orden
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class,
        ]);

        // Crear usuarios de prueba
        $this->createTestUsers();
    }

    private function createTestUsers(): void
    {
        // Usuario administrador
        $adminUser = User::firstOrCreate(
            ['email' => 'mjuchani@megalink.com'],
            [
                'name' => 'Administrador',
                'email' => 'mjuchani@megalink.com',
                'password' => Hash::make('moi123'),
                'email_verified_at' => now(),
            ]
        );
        $adminUser->assignRole('admin');

        // Usuario editor de textos
        $editorUser = User::firstOrCreate(
            ['email' => 'editor@example.com'],
            [
                'name' => 'Editor de Textos',
                'email' => 'editor@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $editorUser->assignRole('editor_textos');

        // Usuario visualizador de textos (demo)
        $viewerUser = User::firstOrCreate(
            ['email' => 'viewer@example.com'],
            [
                'name' => 'Visualizador de Textos',
                'email' => 'viewer@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $viewerUser->assignRole('viewer_textos');
    }
}
