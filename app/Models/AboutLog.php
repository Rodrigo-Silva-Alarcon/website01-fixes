<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Trazabilidad de Admin › Nosotros. Cada fila es un cambio: quién lo hizo, cuándo,
 * desde qué IP y el valor anterior / nuevo. `user_name` se guarda aparte para que el
 * historial siga legible aunque el usuario se elimine.
 */
class AboutLog extends Model
{
    public const UPDATED_AT = null;

    public const ACTIONS = [
        'text_updated' => 'Texto editado',
        'image_replaced' => 'Imagen reemplazada',
        'image_focus' => 'Encuadre ajustado',
        'image_alt' => 'Descripción de imagen',
        'image_moved' => 'Imagen reordenada',
    ];

    protected $fillable = ['user_id', 'user_name', 'action', 'field', 'old_value', 'new_value', 'ip'];

    protected $casts = [
        'old_value' => 'array',
        'new_value' => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Registra un cambio con el usuario y la IP de la petición actual. */
    public static function record(string $action, ?string $field, mixed $old, mixed $new): self
    {
        $user = auth()->user();

        return self::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'action' => $action,
            'field' => $field,
            'old_value' => ['v' => $old],
            'new_value' => ['v' => $new],
            'ip' => request()->ip(),
        ]);
    }
}
