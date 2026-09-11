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

    /**
     * Get the product that owns the inventory.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}





