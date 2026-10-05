<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id',
        'user_id',
        'total',
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_address',
        'customer_lat',
        'customer_lng',
        'notes',
        'status',
        'payment_method',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'customer_lat' => 'float',
        'customer_lng' => 'float',
    ];

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





