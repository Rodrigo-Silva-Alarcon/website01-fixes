<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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
            SubcategorySeeder::class,
            ProductSeeder::class,
            ProductGallerySeeder::class,
        ]);

        // Crear usuarios de prueba
        $this->createTestUsers();
    }

    private function createTestUsers(): void
    {
        // Credenciales por entorno: nunca texto plano en el repositorio.
        // Sin SEED_PASSWORD cada usuario nuevo nace con contraseña aleatoria.
        $password = Hash::make(env('SEED_PASSWORD') ?: Str::random(16));
        $adminEmail = env('SEED_ADMIN_EMAIL', 'admin@example.com');

        // Usuario administrador
        $adminUser = User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'Administrador',
                'email' => $adminEmail,
                'password' => $password,
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
                'password' => $password,
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
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );
        $viewerUser->assignRole('viewer_textos');
    }
}
