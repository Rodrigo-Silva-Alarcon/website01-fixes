<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Sección de la página de inicio (Admin › Página de inicio): tipo, orden, visibilidad y ajustes.
 *
 * settings según el tipo:
 *  - products: source (manual|popular|featured|offers|latest|category), category_id, product_ids, limit
 *  - promo:    product_ids [tarjeta naranja, tarjeta azul]
 *  - features: items [4 x {title, subtitle}] (el subtítulo del 4.º es siempre "WhatsApp {número}")
 *  - showroom: photos [3 x {image, webp, thumb, alt, mirror}] rutas relativas a public/
 */
class HomeSection extends Model
{
    /**
     * Tipos disponibles. single = solo puede haber una; locked = no se puede eliminar ni ocultar.
     */
    public const TYPES = [
        'hero' => ['label' => 'Carrusel de banners', 'single' => true, 'locked' => false],
        'features' => ['label' => 'Beneficios y garantías', 'single' => true, 'locked' => false],
        'categories' => ['label' => 'Explora por categoría', 'single' => true, 'locked' => true],
        'products' => ['label' => 'Productos', 'single' => false, 'locked' => false],
        'promo' => ['label' => 'Tarjetas destacadas', 'single' => false, 'locked' => false],
        'brands' => ['label' => 'Marcas aliadas', 'single' => true, 'locked' => false],
        'showroom' => ['label' => 'Showroom', 'single' => true, 'locked' => false],
    ];

    public const SOURCES = [
        'manual' => 'Elegidos a mano',
        'popular' => 'Productos populares',
        'featured' => 'Productos destacados',
        'offers' => 'En oferta',
        'latest' => 'Más recientes',
        'category' => 'De una categoría',
    ];

    /** Máximo de productos que muestra una sección de productos. */
    public const MAX_PRODUCTS = 12;

    /** Textos de la barra de beneficios tal como estaban en el código (valores por defecto). */
    public const DEFAULT_FEATURES = [
        ['title' => 'Delivery seguro', 'subtitle' => 'Entrega a domicilio'],
        ['title' => 'Garantía', 'subtitle' => 'Devolución del 100% del dinero'],
        ['title' => 'Pago seguro', 'subtitle' => 'Tu dinero está protegido'],
        ['title' => 'Atención personalizada', 'subtitle' => null],
    ];

    /** Fotos del showroom tal como estaban en el código (valores por defecto). */
    public const DEFAULT_SHOWROOM_PHOTOS = [
        ['image' => 'images/about-hero-smarthouse.jpg', 'webp' => 'images/about-hero-smarthouse-480.webp', 'thumb' => null, 'alt' => 'Showroom SmartHouse', 'mirror' => false],
        ['image' => 'data/banners/025f7828-6a10-44a4-979c-35b0eaffacd4.jpg', 'webp' => 'images/showroom-productos.webp', 'thumb' => null, 'alt' => 'Productos SmartHouse', 'mirror' => false],
        ['image' => 'images/about-hero-smarthouse.jpg', 'webp' => 'images/about-hero-smarthouse-480.webp', 'thumb' => null, 'alt' => 'Instalaciones SmartHouse', 'mirror' => true],
    ];

    protected $fillable = ['type', 'title', 'subtitle', 'position', 'active', 'settings'];

    protected $casts = [
        'active' => 'bool',
        'position' => 'integer',
        'settings' => 'array',
    ];

    protected $appends = ['locked'];

    public function getLockedAttribute(): bool
    {
        return (bool) (self::TYPES[$this->type]['locked'] ?? false);
    }

    /** Ids de productos guardados en settings, sin repetidos y en su orden. */
    public function productIds(): array
    {
        return array_values(array_unique(array_map('intval', $this->settings['product_ids'] ?? [])));
    }

    /** Los 4 beneficios; lo que falte o esté vacío toma el texto por defecto. */
    public function featureItems(): array
    {
        $saved = $this->settings['items'] ?? [];

        return array_map(fn (array $default, int $i) => [
            'title' => filled($saved[$i]['title'] ?? null) ? $saved[$i]['title'] : $default['title'],
            // El 4.º lo completa la web con el WhatsApp de Admin › Contacto
            'subtitle' => $i === 3 ? null : (filled($saved[$i]['subtitle'] ?? null) ? $saved[$i]['subtitle'] : $default['subtitle']),
        ], self::DEFAULT_FEATURES, array_keys(self::DEFAULT_FEATURES));
    }

    /** Las 3 fotos del showroom; una posición sin foto guardada usa la de por defecto. */
    public function showroomPhotos(): array
    {
        $saved = $this->settings['photos'] ?? [];

        return array_map(function (array $default, int $i) use ($saved) {
            $photo = $saved[$i] ?? null;

            return filled($photo['image'] ?? null) ? [...$default, ...$photo] : $default;
        }, self::DEFAULT_SHOWROOM_PHOTOS, array_keys(self::DEFAULT_SHOWROOM_PHOTOS));
    }

    /** Fotos del showroom con URLs públicas, solo lo que necesita la web. */
    public function showroomPhotosForWeb(): array
    {
        $url = fn (?string $path) => $path ? '/'.ltrim($path, '/') : null;

        return array_map(fn (array $p) => [
            'src' => $url($p['image']),
            'webp' => $url($p['webp'] ?? null),
            'thumb' => $url($p['thumb'] ?? null),
            'alt' => (string) ($p['alt'] ?? ''),
            'mirror' => (bool) ($p['mirror'] ?? false),
        ], $this->showroomPhotos());
    }
}
