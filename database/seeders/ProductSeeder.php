<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Subcategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class ProductSeeder extends Seeder
{
    /**
     * Productos para Equipos de sonido y Consolas (home vacío).
     * Imágenes en public/data/products/ (Unsplash) + thumbs.
     */
    private const PRODUCTS = [
        // Equipos de sonido (category_id=3)
        [
            'category' => 'Equipos-de-sonido',
            'subcategory' => 'Parlantes',
            'brand' => 'Sony',
            'name' => 'Parlante Sony SRS-XB43',
            'summary' => 'Parlante Bluetooth portátil con Extra Bass y resistencia al agua IP67.',
            'description' => 'Sonido potente con tecnología Extra Bass, batería de hasta 24 horas y resistencia al agua IP67. Ideal para fiestas y uso exterior.',
            'image' => 'data/products/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d.jpg',
            'amount' => 899.00,
            'offer' => 799.00,
            'stock' => 12,
            'pop' => true,
            'featured' => true,
            'order' => 1,
        ],
        [
            'category' => 'Equipos-de-sonido',
            'subcategory' => 'Auriculares-y-audifonos',
            'brand' => 'Sony',
            'name' => 'Auriculares Sony WH-CH520',
            'summary' => 'Auriculares inalámbricos con cancelación de ruido y 50h de batería.',
            'description' => 'Diseño ligero y plegable, sonido nítido con DSEE y hasta 50 horas de reproducción continua.',
            'image' => 'data/products/b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e.jpg',
            'amount' => 449.00,
            'offer' => null,
            'stock' => 20,
            'pop' => true,
            'featured' => false,
            'order' => 2,
        ],
        [
            'category' => 'Equipos-de-sonido',
            'subcategory' => 'Parlantes-con-bateria',
            'brand' => 'Xiaomi',
            'name' => 'Parlante Xiaomi Mi Portable Bluetooth',
            'summary' => 'Parlante portátil con batería de 12 horas y conexión Bluetooth 5.0.',
            'description' => 'Formato compacto con graves profundos, resistente al agua IPX7 y manos libres integrado.',
            'image' => 'data/products/c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f.jpg',
            'amount' => 299.00,
            'offer' => 259.00,
            'stock' => 15,
            'pop' => false,
            'featured' => true,
            'order' => 3,
        ],
        [
            'category' => 'Equipos-de-sonido',
            'subcategory' => 'Minicomponentes',
            'brand' => 'LG',
            'name' => 'Minicomponente LG CM4550',
            'summary' => 'Sistema de audio 4.1 canales con Bluetooth y karaoke.',
            'description' => 'Potencia de 800W, dos micrófonos de karaoke y conectividad Bluetooth para streaming móvil.',
            'image' => 'data/products/d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80.jpg',
            'amount' => 1599.00,
            'offer' => null,
            'stock' => 6,
            'pop' => false,
            'featured' => false,
            'order' => 4,
        ],
        [
            'category' => 'Equipos-de-sonido',
            'subcategory' => 'Sound-bar',
            'brand' => 'Samsung',
            'name' => 'Sound Bar Samsung HW-C450',
            'summary' => 'Barra de sonido 2.1 canales con subwoofer inalámbrico.',
            'description' => 'Audio envolvente 3D y modo juegos optimizado; conexión HDMI ARC y Bluetooth.',
            'image' => 'data/products/e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091.jpg',
            'amount' => 1299.00,
            'offer' => 1149.00,
            'stock' => 8,
            'pop' => true,
            'featured' => true,
            'order' => 5,
        ],
        // Consolas (category_id=5)
        [
            'category' => 'Consolas',
            'subcategory' => 'Videojuegos',
            'brand' => 'Sony',
            'name' => 'Consola PlayStation 5 Slim',
            'summary' => 'PS5 Slim digital con SSD de 1TB y ray tracing.',
            'description' => 'Juegos en 4K a 120fps, DualSense con retroalimentación háptica y catálogo exclusivo PlayStation.',
            'image' => 'data/products/f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f809102.jpg',
            'amount' => 4299.00,
            'offer' => null,
            'stock' => 5,
            'pop' => true,
            'featured' => true,
            'order' => 6,
        ],
        [
            'category' => 'Consolas',
            'subcategory' => 'Videojuegos',
            'brand' => 'Redragon',
            'name' => 'Consola Xbox Series S',
            'summary' => 'Consola Xbox Series S 512GB con juegos en 1440p.',
            'description' => 'Diseño compacto, Game Pass incluido por 3 meses y compatibilidad con miles de títulos.',
            'image' => 'data/products/a7b8c9d0-e1f2-4a3b-4c5d-6e7f80910213.jpg',
            'amount' => 2899.00,
            'offer' => 2699.00,
            'stock' => 7,
            'pop' => false,
            'featured' => true,
            'order' => 7,
        ],
        [
            'category' => 'Consolas',
            'subcategory' => 'Mandos',
            'brand' => 'Redragon',
            'name' => 'Mando Redragon G525 Inalámbrico',
            'summary' => 'Control inalámbrico multiplataforma con retroiluminación RGB.',
            'description' => 'Compatible con PC, Switch y Android; batería recargable y grip antideslizante.',
            'image' => 'data/products/b8c9d0e1-f2a3-4b4c-5d6e-7f8091021324.jpg',
            'amount' => 249.00,
            'offer' => 199.00,
            'stock' => 25,
            'pop' => true,
            'featured' => false,
            'order' => 8,
        ],
        [
            'category' => 'Consolas',
            'subcategory' => 'Accesorios',
            'brand' => 'Redragon',
            'name' => 'Headset Gamer Redragon H710',
            'summary' => 'Auriculares gamer con micrófono retráctil y sonido 7.1.',
            'description' => 'Confort para sesiones largas, iluminación LED y cable trenzado con control de volumen.',
            'image' => 'data/products/c9d0e1f2-a3b4-4c5d-6e7f-809102132435.jpg',
            'amount' => 329.00,
            'offer' => null,
            'stock' => 18,
            'pop' => false,
            'featured' => false,
            'order' => 9,
        ],
        [
            'category' => 'Consolas',
            'subcategory' => 'Videojuegos',
            'brand' => 'Redragon',
            'name' => 'Consola Nintendo Switch OLED',
            'summary' => 'Switch OLED pantalla 7" y 64GB de almacenamiento.',
            'description' => 'Pantalla OLED de 7 pulgadas, dock con salida Ethernet y joy-con divertidos para toda la familia.',
            'image' => 'data/products/d0e1f2a3-b4c5-4d6e-7f80-910213243546.jpg',
            'amount' => 2599.00,
            'offer' => null,
            'stock' => 9,
            'pop' => false,
            'featured' => true,
            'order' => 10,
        ],
    ];

    public function run(): void
    {
        foreach (self::PRODUCTS as $row) {
            $category = Category::where('slug', $row['category'])->first();
            if (! $category) {
                continue;
            }
            $sub = Subcategory::where('slug', $row['subcategory'])
                ->where('category_id', $category->id)
                ->first();
            $brand = Brand::where('name', $row['brand'])->first();

            $product = Product::updateOrCreate(
                ['slug' => ucwords(\Illuminate\Support\Str::slug($row['name']))],
                [
                    'category_id' => $category->id,
                    'subcategory_id' => $sub?->id,
                    'brand_id' => $brand?->id,
                    'name' => $row['name'],
                    'summary' => $row['summary'],
                    'description' => $row['description'],
                    'image' => $row['image'],
                    'active' => true,
                    'featured' => $row['featured'],
                    'pop' => $row['pop'],
                    'order' => $row['order'],
                ]
            );

            Inventory::updateOrCreate(
                ['product_id' => $product->id],
                [
                    'amount' => $row['amount'],
                    'offer_amount' => $row['offer'],
                    'stock' => $row['stock'],
                    'money' => 'Bs.',
                ]
            );
        }

        Cache::forget('web_populares');
        Cache::forget('web_detacados');
        Cache::forget('web_menu');
    }
}
