<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Permisos = ventanas del panel. Agrega Copias de seguridad, quita los permisos de
 * sectores sin ventana (ventas, clientes, proveedores, inventario, productos, carritos)
 * y las acciones que ninguna ventana usa. El admin queda con todos los permisos.
 */
return new class extends Migration
{
    private const UNUSED_SECTORS = ['ventas', 'clientes', 'proveedores', 'inventario', 'productos', 'carts'];

    private const UNUSED_PERMISSIONS = [
        'create_about', 'delete_about', 'show_about',
        'create_contact', 'delete_contact', 'show_contact',
        'create_footer', 'delete_footer', 'show_footer',
        'create_store_texts', 'delete_store_texts', 'show_store_texts',
        'show_home',
        'create_orders', 'delete_orders', 'show_orders',
    ];

    public function up(): void
    {
        if (! DB::table('roles')->exists()) {
            return; // BD nueva: lo hace PermissionSeeder
        }

        $now = now();
        foreach ([
            'view_backups' => 'Ver y descargar copias de seguridad',
            'create_backups' => 'Crear copias de seguridad manuales',
        ] as $name => $description) {
            DB::table('permissions')->insertOrIgnore([
                'name' => $name, 'description' => $description, 'sector' => 'backups',
                'created_at' => $now, 'updated_at' => $now,
            ]);
        }

        DB::table('permissions')->where('sector', 'footer')->where('name', 'view_footer')->update(['description' => 'Ver logo']);
        DB::table('permissions')->where('sector', 'footer')->where('name', 'edit_footer')->update(['description' => 'Editar logo']);

        $unused = DB::table('permissions')
            ->whereIn('sector', self::UNUSED_SECTORS)
            ->orWhereIn('name', self::UNUSED_PERMISSIONS)
            ->pluck('id');
        DB::table('permission_role')->whereIn('permission_id', $unused)->delete();
        DB::table('permissions')->whereIn('id', $unused)->delete();

        $adminId = DB::table('roles')->where('name', 'admin')->value('id');
        if ($adminId) {
            foreach (DB::table('permissions')->pluck('id') as $permissionId) {
                DB::table('permission_role')->insertOrIgnore(['role_id' => $adminId, 'permission_id' => $permissionId]);
            }
        }
    }

    public function down(): void
    {
        // Solo se deshace lo nuevo; los permisos quitados no tenían ventana que los usara
        $ids = DB::table('permissions')->where('sector', 'backups')->pluck('id');
        DB::table('permission_role')->whereIn('permission_id', $ids)->delete();
        DB::table('permissions')->whereIn('id', $ids)->delete();
    }
};
