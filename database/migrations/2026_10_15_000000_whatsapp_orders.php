<?php

use App\Helpers\PermissionHelper;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Pedidos por WhatsApp: al pulsar "Pedir por WhatsApp" se registra un pedido pendiente con
 * la referencia que viaja en el mensaje. En Admin › Pedidos se edita, confirma (descuenta
 * stock) o cancela. Sustituye a Admin › Carrito de compras (permisos carts → orders).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('reference', 20)->nullable()->unique();
            $table->string('money', 10)->default('Bs.');
            $table->timestamp('edited_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancel_reason', 160)->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->index(['status', 'created_at']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('money', 10)->default('Bs.');
        });

        // Los roles que gestionaban carritos pasan a gestionar pedidos (el admin siempre).
        // En una BD nueva los crea PermissionSeeder.
        if (DB::table('roles')->exists()) {
            PermissionHelper::createSectorPermissions('orders', 'pedidos');
            $map = DB::table('permissions')->where('sector', 'orders')->pluck('id', 'name');
            $adminId = DB::table('roles')->where('name', 'admin')->value('id');

            foreach ($map as $name => $permissionId) {
                $roles = DB::table('permission_role')
                    ->join('permissions', 'permissions.id', '=', 'permission_role.permission_id')
                    ->where('permissions.name', str_replace('_orders', '_carts', $name))
                    ->pluck('permission_role.role_id')
                    ->push($adminId)
                    ->filter()
                    ->unique();
                foreach ($roles as $roleId) {
                    DB::table('permission_role')->insertOrIgnore(['role_id' => $roleId, 'permission_id' => $permissionId]);
                }
            }

            $cartIds = DB::table('permissions')->where('sector', 'carts')->pluck('id');
            DB::table('permission_role')->whereIn('permission_id', $cartIds)->delete();
            DB::table('permissions')->whereIn('id', $cartIds)->delete();
        }
    }

    public function down(): void
    {
        if (DB::table('roles')->exists()) {
            PermissionHelper::createSectorPermissions('carts', 'carritos');
            $adminId = DB::table('roles')->where('name', 'admin')->value('id');
            if ($adminId) {
                foreach (DB::table('permissions')->where('sector', 'carts')->pluck('id') as $permissionId) {
                    DB::table('permission_role')->insertOrIgnore(['role_id' => $adminId, 'permission_id' => $permissionId]);
                }
            }
            $orderIds = DB::table('permissions')->where('sector', 'orders')->pluck('id');
            DB::table('permission_role')->whereIn('permission_id', $orderIds)->delete();
            DB::table('permissions')->whereIn('id', $orderIds)->delete();
        }

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('money');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['status', 'created_at']);
            $table->dropConstrainedForeignId('updated_by');
            $table->dropUnique(['reference']);
            $table->dropColumn(['reference', 'money', 'edited_at', 'confirmed_at', 'cancelled_at', 'cancel_reason']);
        });
    }
};
