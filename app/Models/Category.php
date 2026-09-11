<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'summary',
        'image',
        'icon',
        'active',
        'order',
    ];

    protected $casts = [
        'active' => 'bool',
        'order' => 'integer',
    ];
    
    protected $appends =['image_url', 'image_thumbs_url'];

    public function setNameAttribute($value){
        $this->attributes['name'] = $value;
        $this->attributes['slug'] = ucwords(Str::slug($value));
    }

    public function scopePublicados($query)
    {
        return $query->where('active', true);
    }

    public function scopeNoPublicados($query)
    {
        return $query->where('active', false);
    }

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            $imagePath = str_replace('storage/', '', $this->image);
            return asset(config('variables.folder_category'). $imagePath);
        }
        return null;
    }

    public function getImageThumbsUrlAttribute()
    {
        if ($this->image) {
            $imagePath = str_replace('storage/', '', $this->image);
            return asset(config('variables.folder_category'). config('variables.thumbs'). $imagePath);
        }
        return null;
    }

    /**
     * Get the products for the category.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get the subcategories for the category.
     */
    public function subcategories(): HasMany
    {
        return $this->hasMany(Subcategory::class);
    }

}

