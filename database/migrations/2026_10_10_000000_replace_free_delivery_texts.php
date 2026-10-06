<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * "Delivery gratuito/gratis" pasa a "Delivery seguro" en los textos ya guardados desde el panel,
 * se quita "entrega en 24 h" y el costo de envío del resumen del pedido (delivery_label/delivery_value).
 */
return new class extends Migration
{
    private function swap(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }
        $value = preg_replace('/(delivery|env[ií]o)\s+(gratuito|gratis)/iu', 'Delivery seguro', $value);
        $value = preg_replace('/\s*[,·]\s*entrega en 24 ?h(oras)?/iu', '', $value);

        return preg_replace('/^entrega en 24 ?h(oras)?$/iu', 'Entrega a domicilio', $value);
    }

    public function up(): void
    {
        DB::table('texts')->where('name', 'topbar_1')->get(['id', 'content'])->each(
            fn ($row) => DB::table('texts')->where('id', $row->id)->update(['content' => $this->swap($row->content)])
        );

        DB::table('home_sections')->where('type', 'features')->get(['id', 'settings'])->each(function ($row) {
            $settings = json_decode($row->settings ?? 'null', true);
            if (! is_array($settings)) {
                return;
            }
            foreach ($settings['items'] ?? [] as $i => $item) {
                $settings['items'][$i]['title'] = $this->swap($item['title'] ?? null);
                $settings['items'][$i]['subtitle'] = $this->swap($item['subtitle'] ?? null);
            }
            DB::table('home_sections')->where('id', $row->id)->update(['settings' => json_encode($settings, JSON_UNESCAPED_UNICODE)]);
        });

        DB::table('store_settings')->get(['id', 'texts'])->each(function ($row) {
            $texts = json_decode($row->texts ?? 'null', true);
            if (! is_array($texts)) {
                return;
            }
            unset($texts['delivery_label'], $texts['delivery_value']);
            $texts = array_map(fn ($v) => is_string($v) ? $this->swap($v) : $v, $texts);
            DB::table('store_settings')->where('id', $row->id)->update(['texts' => json_encode($texts, JSON_UNESCAPED_UNICODE)]);
        });
    }

    public function down(): void
    {
        // Cambio de contenido: no se restaura el texto anterior.
    }
};
