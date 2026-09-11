<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'product_id',
        'name',
        'image',
        'unit_price',
        'amount',
        'money',
        'sub_total',
    ];

    protected $casts = [
        'amount' => 'integer',
        'unit_price' => 'decimal:2',
        'sub_total' => 'decimal:2',
    ];

    protected $appends =[
        'image_url', 
        'image_thumbs_url' ];
    /**
     * Get the cart that owns the cart item.
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class, 'cart_id');
    }

    /**
     * Get the product that owns the cart item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            $imagePath = str_replace('storage/', '', $this->image);
            return asset(config('variables.folder_product') . $imagePath);
        }
        return null;
    }

    public function getImageThumbsUrlAttribute()
    {
        if ($this->image) {
            $imagePath = str_replace('storage/', '', $this->image);
            return asset(config('variables.folder_product') .config('variables.thumbs') . $imagePath);
        }
        return null;
    }

}





