<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Imágenes adicionales (galería) de los productos de ejemplo.
 *
 * - PS5 y Switch usan fotos reales del catálogo (otras vistas del producto).
 * - El resto usa dos vistas de detalle recortadas de su foto principal
 *   (public/data/images/{slug}-detalle-N.jpg) hasta que se suban fotos propias desde el admin.
 *
 * Es idempotente: no toca productos que ya tienen galería.
 */
class ProductGallerySeeder extends Seeder
{
    private const REAL_PHOTOS = [
        'consola-playstation-5-slim' => [
            'bbc61567-6808-49a1-b6ae-dd141ccea879.jpg', // caja con consola y mando
            '12a62611-7af1-4203-990d-d401358e9e92.jpg', // caja
            '36ce383b-5885-45d1-b0f2-86bb3a482bf3.jpg', // mando DualSense de frente
            'ed57294a-ae31-4401-9f96-7287a507f02f.jpg', // mando DualSense en ángulo
        ],
        'consola-nintendo-switch-oled' => [
            'a0f93198-32b1-4355-8735-410ee47cdd77.jpg', // de frente
            '0791120c-3664-4c08-8eed-a37a81fbb817.jpg', // con base
        ],
    ];

    public function run(): void
    {
        $folder = public_path(config('variables.folder_image'));

        Product::with('images')->get()->each(function (Product $product) use ($folder) {
            if ($product->images->isNotEmpty()) {
                return;
            }

            $slug = Str::slug($product->name);
            $files = self::REAL_PHOTOS[$slug] ?? ["{$slug}-detalle-1.jpg", "{$slug}-detalle-2.jpg"];

            foreach (array_values($files) as $i => $file) {
                if (! is_file($folder.$file)) {
                    continue;
                }
                $product->images()->create([
                    'name' => $file,
                    'original_name' => $file,
                    'order' => $i + 1,
                ]);
            }
        });
    }
}
