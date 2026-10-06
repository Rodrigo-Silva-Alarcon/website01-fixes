<?php

use App\Helpers\PermissionHelper;
use App\Models\StoreSetting;
use App\Services\WebContentService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Admin › Textos de la tienda: textos del carrito, la ficha de producto y los mensajes de
 * WhatsApp. Se crea con los mismos textos que la web mostraba, así nada cambia al migrar.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->json('texts');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        $now = now();
        DB::table('store_settings')->insert([
            'texts' => json_encode(StoreSetting::defaults(), JSON_UNESCAPED_UNICODE),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Permisos del nuevo sector para instalaciones ya sembradas, asignados al rol admin
        // (los demás roles se configuran en Admin › Roles). En una BD nueva los crea PermissionSeeder.
        $adminId = DB::table('roles')->where('name', 'admin')->value('id');
        if ($adminId) {
            PermissionHelper::createSectorPermissions('store_texts', 'Textos de la tienda');
            foreach (DB::table('permissions')->where('sector', 'store_texts')->pluck('id') as $permissionId) {
                DB::table('permission_role')->insertOrIgnore(['role_id' => $adminId, 'permission_id' => $permissionId]);
            }
        }

        WebContentService::flushCache();
    }

    public function down(): void
    {
        $ids = DB::table('permissions')->where('sector', 'store_texts')->pluck('id');
        DB::table('permission_role')->whereIn('permission_id', $ids)->delete();
        DB::table('permissions')->whereIn('id', $ids)->delete();

        Schema::dropIfExists('store_settings');

        WebContentService::flushCache();
    }
};
