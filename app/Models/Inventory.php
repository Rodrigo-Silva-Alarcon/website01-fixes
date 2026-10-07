<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'amount',
        'stock',
        'offer_amount',
        'ini',
        'fin',
        'money',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'offer_amount' => 'decimal:2',
        'stock' => 'integer',
    ];

    public function getStockAttribute($value): int
    {
        return $value ?? 0;
    }

    /**
     * Oferta vigente: offer_amount > 0 y hoy (zona de la tienda) dentro de la ventana
     * ini..fin, ambas inclusive y comparadas por día (el día de fin cuenta completo).
     */
    public function isOnOffer(?string $today = null): bool
    {
        $today ??= now()->toDateString();
        $ini = $this->ini ? substr((string) $this->ini, 0, 10) : null;
        $fin = $this->fin ? substr((string) $this->fin, 0, 10) : null;

        return (float) $this->offer_amount > 0
            && ($ini !== null || $fin !== null)
            && ($ini === null || $ini <= $today)
            && ($fin === null || $fin >= $today);
    }

    /** Precio al que se vende y cobra hoy: el de oferta si está vigente. */
    public function currentPrice(): float
    {
        return (float) ($this->isOnOffer() ? $this->offer_amount : $this->amount);
    }

    /**
     * Get the product that owns the inventory.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}





