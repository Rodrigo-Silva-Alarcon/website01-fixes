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
     * 23=headphones 24=tv 29=gamepad 30=lavadora 08=desktop 18=mobile
     */
    /**
     * Categorias del menu superior, en su orden. Televisores y Celulares no tienen subcategorias.
     */
    private const CATEGORIES = [
        ['slug' => 'Televisores', 'name' => 'Televisores', 'icon' => '08', 'order' => 1],
        ['slug' => 'Cocina', 'name' => 'Cocina', 'icon' => '12', 'order' => 2],
        ['slug' => 'Equipos-de-sonido', 'name' => 'Equipos de sonido', 'icon' => '14', 'order' => 3],
        ['slug' => 'Electrodomesticos', 'name' => 'Electrodomésticos', 'icon' => '37', 'order' => 4],
        ['slug' => 'Celulares', 'name' => 'Celulares', 'icon' => '18', 'order' => 5],
        ['slug' => 'Consolas', 'name' => 'Consolas', 'icon' => '19', 'order' => 6],
    ];

    private const SUBCATEGORIES = [
        'Electrodomesticos' => [
            ['name' => 'Refrigeradoras', 'icon' => '31', 'order' => 1],
            ['name' => 'Lavadoras', 'icon' => '37', 'order' => 2],
            ['name' => 'Estufas', 'icon' => '40', 'order' => 3],
        ],
        'Cocina' => [
            ['name' => 'Refrigeradores', 'icon' => '31', 'order' => 1],
            ['name' => 'Hornos', 'icon' => '40', 'order' => 2],
            ['name' => 'Microondas', 'icon' => '39', 'order' => 3],
            ['name' => 'Sofás', 'icon' => '31', 'order' => 4, 'active' => false],
            ['name' => 'Comedores', 'icon' => '31', 'order' => 5, 'active' => false],
        ],
        'Equipos-de-sonido' => [
            ['name' => 'Parlantes', 'icon' => '14', 'order' => 1],
            ['name' => 'Auriculares y audifonos', 'icon' => '30', 'order' => 2],
            ['name' => 'Parlantes con bateria', 'icon' => '14', 'order' => 3],
            ['name' => 'Minicomponentes', 'icon' => '14', 'order' => 4],
            ['name' => 'Sound Bar', 'icon' => '14', 'order' => 5],
        ],
        'Consolas' => [
            ['name' => 'Videojuegos', 'icon' => '19', 'order' => 1],
            ['name' => 'Accesorios', 'icon' => '19', 'order' => 2],
            ['name' => 'Mandos', 'icon' => '19', 'order' => 3],
        ],
    ];

    public function run(): void
    {
        foreach (self::CATEGORIES as $row) {
            $category = Category::firstOrNew(['slug' => $row['slug']]);
            if (! $category->exists) {
                $category->name = $row['name'];
                $category->active = true;
            }
            $category->icon = $row['icon'];
            $category->order = $row['order'];
            $category->save();
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
