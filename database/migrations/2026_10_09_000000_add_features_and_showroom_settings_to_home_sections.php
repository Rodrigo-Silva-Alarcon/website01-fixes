<?php

use App\Models\HomeSection;
use App\Services\WebContentService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Beneficios y fotos del showroom pasan a ser editables desde Admin › Página de inicio.
 * Se rellenan con los textos y fotos que ya mostraba la web para que nada cambie al migrar.
 */
return new class extends Migration
{
    public function up(): void
    {
        $defaults = [
            'features' => ['items' => HomeSection::DEFAULT_FEATURES],
            'showroom' => ['photos' => HomeSection::DEFAULT_SHOWROOM_PHOTOS],
        ];

        foreach ($defaults as $type => $values) {
            foreach (DB::table('home_sections')->where('type', $type)->get(['id', 'settings']) as $row) {
                $settings = json_decode($row->settings ?? '[]', true) ?: [];
                DB::table('home_sections')->where('id', $row->id)->update([
                    'settings' => json_encode([...$values, ...$settings]),
                ]);
            }
        }

        WebContentService::flushCache();
    }

    public function down(): void
    {
        foreach (DB::table('home_sections')->whereIn('type', ['features', 'showroom'])->get(['id', 'settings']) as $row) {
            $settings = json_decode($row->settings ?? '[]', true) ?: [];
            unset($settings['items'], $settings['photos']);
            DB::table('home_sections')->where('id', $row->id)->update(['settings' => json_encode($settings)]);
        }

        WebContentService::flushCache();
    }
};
