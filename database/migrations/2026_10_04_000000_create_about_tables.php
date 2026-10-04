<?php

use App\Helpers\PermissionHelper;
use App\Services\WebContentService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Página "Nosotros" editable desde el panel (Admin › Nosotros):
 * - about_page: textos (una sola fila).
 * - about_images: las 4 fotos de la galería con su punto focal.
 * - about_logs: trazabilidad de cada cambio (quién, cuándo, antes → después).
 * Se crean con el contenido que ya se mostraba para que la web no cambie al migrar.
 */
return new class extends Migration
{
    private const IMAGES = [
        ['store-audio', 'Sistema de sonido en sala', 50, 50],
        ['store-lavadora', 'Lavadora de carga frontal', 50, 50],
        ['store-refri', 'Refrigeradora side by side', 50, 50],
        ['store-tv', 'Smart TV en sala moderna', 65, 50],
    ];

    public function up(): void
    {
        Schema::create('about_page', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('title_highlight')->nullable();
            $table->text('intro');
            $table->string('mission_title')->default('Misión');
            $table->text('mission');
            $table->string('vision_title')->default('Visión');
            $table->text('vision');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('about_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('position')->unique();
            $table->string('image');
            $table->string('fallback')->nullable();
            $table->string('alt')->default('');
            $table->unsignedTinyInteger('focus_x')->default(50);
            $table->unsignedTinyInteger('focus_y')->default(50);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('about_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('action', 40)->index();
            $table->string('field', 60)->nullable();
            $table->json('old_value')->nullable();
            $table->json('new_value')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });

        $now = now();

        DB::table('about_page')->insert([
            'title' => 'Sobre Smart House',
            'title_highlight' => 'Bolivia',
            'intro' => 'Smart House es una empresa boliviana especializada en la venta de electrodomésticos, muebles y tecnología para el hogar. Ofrecemos una amplia gama de productos de marcas reconocidas, con atención personalizada y precios competitivos en todo el país. Nuestro compromiso es brindar soluciones prácticas y de calidad para que cada hogar cuente con lo mejor.',
            'mission' => 'Ofrecer a nuestros clientes productos de calidad para el hogar, con atención cercana, precios justos y entrega confiable en toda Bolivia, construyendo relaciones de largo plazo basadas en la confianza y el servicio.',
            'vision' => 'Ser la tienda de referencia en Bolivia para electrodomésticos, muebles y tecnología, reconocida por la calidad de su catálogo, la innovación de sus servicios y la satisfacción de sus clientes.',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        foreach (self::IMAGES as $i => [$file, $alt, $x, $y]) {
            DB::table('about_images')->insert([
                'position' => $i + 1,
                'image' => "images/about/{$file}.webp",
                'fallback' => "images/about/{$file}.jpg",
                'alt' => $alt,
                'focus_x' => $x,
                'focus_y' => $y,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Permisos del nuevo sector para instalaciones ya sembradas, asignados al rol admin
        // (los demás roles se configuran en Admin › Roles). En una BD nueva los crea PermissionSeeder.
        $adminId = DB::table('roles')->where('name', 'admin')->value('id');
        if ($adminId) {
            PermissionHelper::createSectorPermissions('about', 'Nosotros');
            foreach (DB::table('permissions')->where('sector', 'about')->pluck('id') as $permissionId) {
                DB::table('permission_role')->insertOrIgnore(['role_id' => $adminId, 'permission_id' => $permissionId]);
            }
        }

        WebContentService::flushCache();
    }

    public function down(): void
    {
        $ids = DB::table('permissions')->where('sector', 'about')->pluck('id');
        DB::table('permission_role')->whereIn('permission_id', $ids)->delete();
        DB::table('permissions')->whereIn('id', $ids)->delete();

        Schema::dropIfExists('about_logs');
        Schema::dropIfExists('about_images');
        Schema::dropIfExists('about_page');

        WebContentService::flushCache();
    }
};
