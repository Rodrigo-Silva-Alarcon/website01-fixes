<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Datos de contacto, horario de atención y textos de Contáctanos (una sola fila).
 * `show_map` muestra u oculta el mapa del showroom en Contáctanos.
 * Es la fuente única de teléfono, correo, dirección y horario para toda la web.
 *
 * Horario: un elemento por día (1 = lunes … 7 = domingo) con uno de tres modos:
 * - continuous: abre y cierra una vez (open → close)
 * - split: con pausa al mediodía (open → close y open2 → close2)
 * - closed: no se atiende
 */
class ContactSetting extends Model
{
    public const DAYS = [1 => 'Lunes', 2 => 'Martes', 3 => 'Miércoles', 4 => 'Jueves', 5 => 'Viernes', 6 => 'Sábado', 7 => 'Domingo'];

    public const MODES = ['continuous', 'split', 'closed'];

    public const DEFAULT_SCHEDULE = [
        ['day' => 1, 'mode' => 'continuous', 'open' => '09:00', 'close' => '18:00', 'open2' => null, 'close2' => null],
        ['day' => 2, 'mode' => 'continuous', 'open' => '09:00', 'close' => '18:00', 'open2' => null, 'close2' => null],
        ['day' => 3, 'mode' => 'continuous', 'open' => '09:00', 'close' => '18:00', 'open2' => null, 'close2' => null],
        ['day' => 4, 'mode' => 'continuous', 'open' => '09:00', 'close' => '18:00', 'open2' => null, 'close2' => null],
        ['day' => 5, 'mode' => 'continuous', 'open' => '09:00', 'close' => '18:00', 'open2' => null, 'close2' => null],
        ['day' => 6, 'mode' => 'continuous', 'open' => '10:00', 'close' => '16:00', 'open2' => null, 'close2' => null],
        ['day' => 7, 'mode' => 'closed', 'open' => null, 'close' => null, 'open2' => null, 'close2' => null],
    ];

    public const DEFAULT_TEXTS = [
        'hero_title' => 'Contáctanos',
        'hero_subtitle' => 'Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto.',
        'hours_title' => 'Horario de atención',
        'hours_note' => null,
    ];

    /** Datos de contacto, con su etiqueta para el historial. */
    public const DATA_FIELDS = [
        'whatsapp' => 'WhatsApp',
        'phone' => 'Teléfono fijo',
        'email' => 'Correo',
        'address' => 'Dirección',
        'city' => 'Ciudad',
        'maps_url' => 'Enlace de Google Maps',
        'website' => 'Sitio web',
        'facebook' => 'Facebook',
        'instagram' => 'Instagram',
        'twitter' => 'X / Twitter',
        'tiktok' => 'TikTok',
    ];

    /** Textos y opciones de la página Contáctanos, con su etiqueta para el historial. */
    public const TEXT_FIELDS = [
        'hero_title' => 'Título principal',
        'hero_subtitle' => 'Descripción del encabezado',
        'show_map' => 'Mapa del showroom',
        'hours_title' => 'Título del horario',
        'hours_note' => 'Nota del horario',
    ];

    protected $fillable = [
        ...['whatsapp', 'phone', 'email', 'address', 'city', 'maps_url', 'website', 'facebook', 'instagram', 'twitter', 'tiktok'],
        'schedule', 'schedule_summary',
        ...['hero_title', 'hero_subtitle', 'show_map', 'hours_title', 'hours_note'],
        'updated_by',
    ];

    protected $casts = [
        'schedule' => 'array',
        'show_map' => 'boolean',
    ];

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /** Horario de un día en texto: "09:00 – 18:00", "09:00 – 12:30 y 14:30 – 19:00" o "Cerrado". */
    public static function describeDay(array $day): string
    {
        return match ($day['mode'] ?? 'closed') {
            'continuous' => "{$day['open']} – {$day['close']}",
            'split' => "{$day['open']} – {$day['close']} y {$day['open2']} – {$day['close2']}",
            default => 'Cerrado',
        };
    }

    /** Deja cada día solo con las horas que usa su modo. */
    public static function normalizeDay(array $day): array
    {
        $mode = $day['mode'];

        return [
            'day' => (int) $day['day'],
            'mode' => $mode,
            'open' => $mode === 'closed' ? null : $day['open'],
            'close' => $mode === 'closed' ? null : $day['close'],
            'open2' => $mode === 'split' ? $day['open2'] : null,
            'close2' => $mode === 'split' ? $day['close2'] : null,
        ];
    }
}
