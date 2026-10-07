<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    public const PENDING = 'pending';
    public const CONFIRMED = 'confirmed';
    public const CANCELLED = 'cancelled';

    public const STATUSES = [self::PENDING, self::CONFIRMED, self::CANCELLED];

    protected $fillable = [
        'card_id',
        'user_id',
        'reference',
        'total',
        'money',
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_address',
        'customer_lat',
        'customer_lng',
        'notes',
        'status',
        'payment_method',
        'edited_at',
        'confirmed_at',
        'cancelled_at',
        'cancel_reason',
        'updated_by',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'customer_lat' => 'float',
        'customer_lng' => 'float',
        'edited_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function isPending(): bool
    {
        return $this->status === self::PENDING;
    }

    /** Referencia visible: la del mensaje de WhatsApp o, en pedidos antiguos, el id. */
    public function getCodeAttribute(): string
    {
        return $this->reference ?: '#'.$this->id;
    }

    /**
     * Get the cart that owns the order.
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class, 'card_id');
    }

    /**
     * Get the user that owns the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Usuario del panel que hizo el último cambio (editar, confirmar o cancelar). */
    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the order items for the order.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the payments for the order.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
