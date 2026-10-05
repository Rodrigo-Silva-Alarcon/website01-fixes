<?php

use App\Helpers\PermissionHelper;
use App\Services\WebContentService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Secciones de la página de inicio editables desde Admin › Página de inicio.
 * Se crean con el mismo orden y contenido que ya mostraba la web para que nada cambie al migrar.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_sections', function (Blueprint $table) {
            $table->id();
            $table->string('type', 30)->index();
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->unsignedSmallInteger('position')->default(0)->index();
            $table->boolean('active')->default(true);
            $table->json('settings')->nullable();
            $table->timestamps();
        });

        $sections = [
            ['hero', null, null, []],
            ['features', null, null, []],
            ['categories', 'Categorías', 'Explora por categoría', []],
            ['products', 'Productos populares', null, ['source' => 'popular', 'limit' => 8]],
        ];

        // Un bloque por categoría con productos, con las tarjetas destacadas entre Consolas y Equipos de sonido
        $categories = DB::table('categories')->where('active', true)
            ->whereExists(fn ($q) => $q->select(DB::raw(1))->from('products')
                ->whereColumn('products.category_id', 'categories.id')->where('products.active', true))
            ->orderBy('order')->orderByDesc('id')->get(['id', 'name']);

        $slot = $this->promoSlot($categories->pluck('name')->all());
        $promoIds = DB::table('products')->where('active', true)->where('featured', true)
            ->orderBy('order')->orderByDesc('id')->limit(2)->pluck('id')->all();
        if (count($promoIds) < 2) {
            $promoIds = DB::table('products')->where('active', true)->where('pop', true)
                ->orderBy('order')->orderByDesc('id')->limit(2)->pluck('id')->all();
        }
        $promo = ['promo', null, null, ['product_ids' => $promoIds]];

        if ($categories->isEmpty()) {
            $sections[] = $promo;
        }
        foreach ($categories as $i => $category) {
            $sections[] = ['products', $category->name, null, ['source' => 'category', 'category_id' => $category->id, 'limit' => 4]];
            if ($i === $slot) {
                $sections[] = $promo;
            }
        }

        $sections[] = ['brands', 'Marcas con las que trabajamos', 'Aliados', []];
        $sections[] = ['showroom', 'Ven a conocer los productos en persona.', 'Nuestro showroom', []];

        $now = now();
        foreach ($sections as $position => [$type, $title, $subtitle, $settings]) {
            DB::table('home_sections')->insert([
                'type' => $type,
                'title' => $title,
                'subtitle' => $subtitle,
                'position' => $position + 1,
                'active' => true,
                'settings' => json_encode($settings),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Permisos del nuevo sector para instalaciones ya sembradas (en una BD nueva los crea PermissionSeeder)
        $adminId = DB::table('roles')->where('name', 'admin')->value('id');
        if ($adminId) {
            PermissionHelper::createSectorPermissions('home', 'secciones de inicio');
            foreach (DB::table('permissions')->where('sector', 'home')->pluck('id') as $permissionId) {
                DB::table('permission_role')->insertOrIgnore(['role_id' => $adminId, 'permission_id' => $permissionId]);
            }
        }

        WebContentService::flushCache();
    }

    /** Igual que el antiguo BlockCategory: entre Consolas y Sonido; si no, tras Consolas; si no, tras el primero. */
    private function promoSlot(array $names): int
    {
        $consolas = fn ($n) => (bool) preg_match('/consola/i', $n);
        $sonido = fn ($n) => (bool) preg_match('/sonido/i', $n);
        for ($i = 0; $i < count($names) - 1; $i++) {
            [$a, $b] = [$names[$i], $names[$i + 1]];
            if (($consolas($a) && $sonido($b)) || ($sonido($a) && $consolas($b))) {
                return $i;
            }
        }
        foreach ($names as $i => $name) {
            if ($consolas($name)) {
                return $i;
            }
        }

        return 0;
    }

    public function down(): void
    {
        $ids = DB::table('permissions')->where('sector', 'home')->pluck('id');
        DB::table('permission_role')->whereIn('permission_id', $ids)->delete();
        DB::table('permissions')->whereIn('id', $ids)->delete();

        Schema::dropIfExists('home_sections');

        WebContentService::flushCache();
    }
};
