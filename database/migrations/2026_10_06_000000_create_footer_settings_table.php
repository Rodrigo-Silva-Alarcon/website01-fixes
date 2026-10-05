<?php

use App\Helpers\PermissionHelper;
use App\Services\WebContentService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Admin › Footer: logo del pie de página (una versión para modo claro y otra para modo oscuro,
 * o una sola si tiene fondo transparente) y los textos de la franja inferior.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('footer_settings', function (Blueprint $table) {
            $table->id();
            // Logo: WebP + PNG de respaldo (ambos conservan la transparencia)
            $table->string('logo_light')->nullable();
            $table->string('logo_light_fallback')->nullable();
            $table->string('logo_dark')->nullable();
            $table->string('logo_dark_fallback')->nullable();
            // Fondo transparente: el logo claro sirve para ambos modos y no se cambia
            $table->boolean('logo_transparent')->default(false);
            $table->string('logo_alt', 150);
            // Franja inferior
            $table->string('copyright', 200);
            $table->string('credits', 120)->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        $now = now();
        DB::table('footer_settings')->insert([
            'logo_alt' => 'Smart House Importaciones SRL',
            'copyright' => '© Smart House, {año}. Todos los derechos reservados.',
            'credits' => 'Desarrollado por MegaLink S.R.L.',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Permisos del nuevo sector para instalaciones ya sembradas, asignados al rol admin
        // (los demás roles se configuran en Admin › Roles). En una BD nueva los crea PermissionSeeder.
        $adminId = DB::table('roles')->where('name', 'admin')->value('id');
        if ($adminId) {
            PermissionHelper::createSectorPermissions('footer', 'Footer');
            foreach (DB::table('permissions')->where('sector', 'footer')->pluck('id') as $permissionId) {
                DB::table('permission_role')->insertOrIgnore(['role_id' => $adminId, 'permission_id' => $permissionId]);
            }
        }

        WebContentService::flushCache();
    }

    public function down(): void
    {
        $ids = DB::table('permissions')->where('sector', 'footer')->pluck('id');
        DB::table('permission_role')->whereIn('permission_id', $ids)->delete();
        DB::table('permissions')->whereIn('id', $ids)->delete();

        Schema::dropIfExists('footer_settings');

        WebContentService::flushCache();
    }
};
