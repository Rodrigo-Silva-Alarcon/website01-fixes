<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class SubcategorySeeder extends Seeder
{
    /**
     * Iconos TYPE_SVG_ICONS (resources/js/types/Data.ts).
     * 12=chef_hat 14=brand_awareness(speaker) 15=smart_toy 19=sports_esports
     * 23=headphones 24=tv 29=gamepad 30=lavadora 08=desktop
     */
    private const CATEGORY_ICONS = [
        'Electrodomesticos' => '30',
        'Cocina' => '12',
        'Equipos-de-sonido' => '14',
        'Consolas' => '19',
    ];

    private const SUBCATEGORIES = [
        'Electrodomesticos' => [
            ['name' => 'Refrigeradoras', 'icon' => '24', 'order' => 1],
            ['name' => 'Lavadoras', 'icon' => '30', 'order' => 2],
            ['name' => 'Estufas', 'icon' => '12', 'order' => 3],
        ],
        'Cocina' => [
            ['name' => 'Refrigeradores', 'icon' => '24', 'order' => 1],
            ['name' => 'Hornos', 'icon' => '12', 'order' => 2],
            ['name' => 'Microondas', 'icon' => '08', 'order' => 3],
            ['name' => 'Sofás', 'icon' => '24', 'order' => 4, 'active' => false],
            ['name' => 'Comedores', 'icon' => '12', 'order' => 5, 'active' => false],
        ],
        'Equipos-de-sonido' => [
            ['name' => 'Parlantes', 'icon' => '14', 'order' => 1],
            ['name' => 'Auriculares y audifonos', 'icon' => '23', 'order' => 2],
            ['name' => 'Parlantes con bateria', 'icon' => '14', 'order' => 3],
            ['name' => 'Minicomponentes', 'icon' => '08', 'order' => 4],
            ['name' => 'Sound Bar', 'icon' => '14', 'order' => 5],
        ],
        'Consolas' => [
            ['name' => 'Videojuegos', 'icon' => '19', 'order' => 1],
            ['name' => 'Accesorios', 'icon' => '29', 'order' => 2],
            ['name' => 'Mandos', 'icon' => '29', 'order' => 3],
        ],
    ];

    public function run(): void
    {
        foreach (self::CATEGORY_ICONS as $slug => $icon) {
            Category::where('slug', $slug)->update(['icon' => $icon]);
        }

        foreach (self::SUBCATEGORIES as $categorySlug => $rows) {
            $category = Category::where('slug', $categorySlug)->first();
            if (! $category) {
                continue;
            }

            foreach ($rows as $row) {
                Subcategory::updateOrCreate(
                    [
                        'category_id' => $category->id,
                        'name' => $row['name'],
                    ],
                    [
                        'icon' => $row['icon'],
                        'active' => $row['active'] ?? true,
                        'order' => $row['order'],
                    ]
                );
            }
        }

        Cache::forget('web_menu');
    }
}
