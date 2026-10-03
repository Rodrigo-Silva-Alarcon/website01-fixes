<?php

use App\Services\WebContentService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Textos de la tienda que antes estaban fijos en el frontend. Se crean con el valor
 * que ya se mostraba para que aparezcan en Admin › Textos y se puedan editar.
 * No pisa textos que ya existan con el mismo nombre.
 */
return new class extends Migration
{
    private const TEXTS = [
        'showroom_address' => '<p>Av. 20 de Octubre</p><p>Esq. Rosendo Gutierrez</p><p>Edif. Guadalquivir #2332</p>',
        'business_hours' => 'Atención de lunes a sábado',
        'site_url' => 'www.smarthousebo.com',
        'topbar_1' => 'Delivery gratuito',
        'topbar_2' => 'Promociones y descuentos exclusivos',
        'topbar_3' => 'Atención de lunes a sábado',
    ];

    public function up(): void
    {
        $now = now();

        foreach (self::TEXTS as $name => $content) {
            if (DB::table('texts')->where('name', $name)->exists()) {
                continue;
            }

            DB::table('texts')->insert([
                'name' => $name,
                'date' => $now->toDateString(),
                'gender' => 'male',
                'type' => json_encode(['article']),
                'print_view' => 'a4',
                'content' => $content,
                'publish' => true,
                'sector' => 'texto',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        WebContentService::flushCache();
    }

    public function down(): void
    {
        DB::table('texts')->whereIn('name', array_keys(self::TEXTS))->delete();
        WebContentService::flushCache();
    }
};
