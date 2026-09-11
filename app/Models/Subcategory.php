<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Subcategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'summary',
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
    public function scopePublicados($query){
        return $query->where('active', true);
    }

    public function scopeNoPublicados($query){
        return $query->where('active', false);
    }
    /**
     * Get the category that owns the subcategory.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
    /**
     * Get the products for the category.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function getCategoryLabelAttribute(){
        
        $categories = Category::pluck('name', 'id');
        return $categories[$this->category_id] ?? ucfirst($this->category_id);
    }
    
    public function getCategorySlugAttribute(){
        
        $categories = Category::pluck('slug', 'id');
        return $categories[$this->category_id] ?? ucfirst($this->category_id);
    }

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            $imagePath = str_replace('storage/', '', $this->image);
            return asset(config('variables.folder_subcategory'). $imagePath);
        }
        return null;
    }

    public function getImageThumbsUrlAttribute()
    {
        if ($this->image) {
            $imagePath = str_replace('storage/', '', $this->image);
            return asset(config('variables.folder_subcategory'). config('variables.thumbs'). $imagePath);
        }
        return null;
    }
}

