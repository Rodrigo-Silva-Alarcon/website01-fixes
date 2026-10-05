<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Sección de la página de inicio (Admin › Página de inicio): tipo, orden, visibilidad y ajustes.
 *
 * settings según el tipo:
 *  - products: source (manual|popular|featured|offers|latest|category), category_id, product_ids, limit
 *  - promo:    product_ids [tarjeta naranja, tarjeta azul]
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
}
