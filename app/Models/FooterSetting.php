<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pie de página de la web (una sola fila): logo y textos de la franja inferior.
 *
 * Logo:
 * - logo_transparent = true: una sola imagen (logo_light) para ambos modos, no se cambia.
 * - logo_transparent = false: logo_light en modo claro y logo_dark en modo oscuro;
 *   si falta logo_dark, en modo oscuro se muestra logo_light sobre su pastilla blanca.
 * - Sin logo_light se usa el logo por defecto del sitio.
 */
class FooterSetting extends Model
{
    public const DEFAULT_LOGO = '/images/logo-smarthouse.png';

    /** Marcador del año actual en el texto de copyright. */
    public const YEAR_TOKEN = '{año}';

    protected $fillable = [
        'logo_light', 'logo_light_fallback', 'logo_dark', 'logo_dark_fallback',
        'logo_transparent', 'logo_alt', 'copyright', 'credits', 'updated_by',
    ];

    protected $casts = [
        'logo_transparent' => 'boolean',
    ];

    protected $appends = ['logo_light_url', 'logo_dark_url'];

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function getLogoLightUrlAttribute(): ?string
    {
        return self::url($this->logo_light);
    }

    public function getLogoDarkUrlAttribute(): ?string
    {
        return self::url($this->logo_dark);
    }

    /** Datos que necesita el Footer público, ya resueltos según el modo del logo. */
    public function toPublicArray(): array
    {
        $light = $this->logo_light
            ? ['src' => self::url($this->logo_light), 'fallback' => self::url($this->logo_light_fallback)]
            : ['src' => self::DEFAULT_LOGO, 'fallback' => null];
        $dark = ! $this->logo_transparent && $this->logo_dark
            ? ['src' => self::url($this->logo_dark), 'fallback' => self::url($this->logo_dark_fallback)]
            : null;

        return [
            'logo' => [
                'light' => $light,
                'dark' => $dark,
                // Con logo transparente o una versión oscura, la pastilla del logo sigue el tema
                'themed' => ($this->logo_transparent && $this->logo_light) || $dark !== null,
                'alt' => $this->logo_alt,
            ],
            'copyright' => $this->copyright,
            'credits' => $this->credits,
        ];
    }

    /** Relativa a la raíz: con asset() el host de APP_URL puede no coincidir con el de la visita. */
    private static function url(?string $path): ?string
    {
        return $path ? '/'.ltrim($path, '/') : null;
    }
}
