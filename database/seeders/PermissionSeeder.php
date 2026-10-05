<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Helpers\PermissionHelper;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Permisos básicos del sistema
        $basicPermissions = [
            // Permisos generales
            [
                'name' => 'access_dashboard',
                'description' => 'Acceder al dashboard',
                'sector' => 'general',
            ],
            [
                'name' => 'view_profile',
                'description' => 'Ver perfil propio',
                'sector' => 'general',
            ],
            [
                'name' => 'edit_profile',
                'description' => 'Editar perfil propio',
                'sector' => 'general',
            ],
        ];

        // Crear permisos básicos
        foreach ($basicPermissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }

        // Crear permisos para sectores existentes usando el helper
        $this->createSectorPermissions('users', 'usuarios');
        
        // Crear permiso específico para cambiar contraseñas
        Permission::firstOrCreate(
            ['name' => 'change_password'],
            [
                'name' => 'change_password',
                'description' => 'Cambiar contraseñas de usuarios',
                'sector' => 'users',
            ]
        );
        
        $this->createSectorPermissions('roles', 'roles');
        $this->createSectorPermissions('permissions', 'permisos');
        
        // Textos con permisos adicionales
        $this->createSectorPermissions('texts', 'textos', [
            'publish_texts' => 'Publicar/despublicar textos'
        ]);

        // Permisos granulares de catálogo y operaciones (§4.8.8)
        $this->createSectorPermissions('products', 'productos');
        $this->createSectorPermissions('categories', 'categorías');
        $this->createSectorPermissions('subcategories', 'subcategorías');
        $this->createSectorPermissions('brands', 'marcas');
        $this->createSectorPermissions('banners', 'banners');
        $this->createSectorPermissions('about', 'Nosotros');
        $this->createSectorPermissions('contact', 'Contacto');
        $this->createSectorPermissions('footer', 'Footer');
        $this->createSectorPermissions('home', 'secciones de inicio');
        $this->createSectorPermissions('inventories', 'inventarios');
        $this->createSectorPermissions('carts', 'carritos');
    }

    /**
     * Crear permisos para un sector usando el helper
     */
    private function createSectorPermissions(string $sector, string $sectorName, array $additionalActions = []): void
    {
        PermissionHelper::createSectorPermissions($sector, $sectorName, $additionalActions);
    }
}
