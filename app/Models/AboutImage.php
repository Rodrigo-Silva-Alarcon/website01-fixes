<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Foto de la galería de "Nosotros". `position` (1-4) es el lugar en la grilla:
 * 1 y 4 son las tarjetas anchas (4/5), 2 y 3 las angostas (3/5).
 * focus_x / focus_y (0-100) es el punto de la foto que queda centrado al recortarla.
 */
class AboutImage extends Model
{
    public const SLOTS = 4;

    protected $fillable = ['position', 'image', 'fallback', 'alt', 'focus_x', 'focus_y', 'updated_by'];

    protected $casts = [
        'position' => 'integer',
        'focus_x' => 'integer',
        'focus_y' => 'integer',
    ];

    protected $appends = ['image_url', 'fallback_url'];

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function getImageUrlAttribute(): string
    {
        return self::versionedUrl($this->image);
    }

    public function getFallbackUrlAttribute(): ?string
    {
        return $this->fallback ? self::versionedUrl($this->fallback) : null;
    }

    /**
     * URL pública con ?v= (fecha del archivo) para invalidar la caché del navegador al reemplazarla.
     * Relativa a la raíz: con asset() el host de APP_URL puede no coincidir con el de la visita y la CSP la bloquea.
     */
    public static function versionedUrl(string $path): string
    {
        $file = public_path($path);

        return '/'.ltrim($path, '/').(is_file($file) ? '?v='.filemtime($file) : '');
    }

    /** Lo que necesita la web pública. */
    public function toPublicArray(): array
    {
        return [
            'position' => $this->position,
            'webp' => $this->image_url,
            'src' => $this->fallback_url ?? $this->image_url,
            'alt' => $this->alt,
            'focus' => "{$this->focus_x}% {$this->focus_y}%",
        ];
    }
}
