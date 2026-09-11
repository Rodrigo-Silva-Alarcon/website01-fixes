<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener roles
        $adminRole = Role::where('name', 'admin')->first();
        $editorTextosRole = Role::where('name', 'editor_textos')->first();
        $viewerTextosRole = Role::where('name', 'viewer_textos')->first();

        // Obtener todos los permisos
        $allPermissions = Permission::all();

        // Admin: Todos los permisos
        if ($adminRole && $allPermissions->isNotEmpty()) {
            $adminRole->permissions()->sync($allPermissions->pluck('id'));
        }

        // Editor de textos: Permisos completos sobre textos + permisos generales
        if ($editorTextosRole) {
            $editorPermissions = $allPermissions->whereIn('name', [
                'view_texts', 'create_texts', 'edit_texts', 'delete_texts', 'show_texts', 'publish_texts',
                'access_dashboard', 'view_profile', 'edit_profile',
            ]);
            $editorTextosRole->permissions()->sync($editorPermissions->pluck('id'));
        }

        // Viewer de textos: Solo permisos de visualización de textos + permisos generales
        if ($viewerTextosRole) {
            $viewerPermissions = $allPermissions->whereIn('name', [
                'view_texts', 'show_texts',
                'access_dashboard', 'view_profile', 'edit_profile',
            ]);
            $viewerTextosRole->permissions()->sync($viewerPermissions->pluck('id'));
        }
    }
}
