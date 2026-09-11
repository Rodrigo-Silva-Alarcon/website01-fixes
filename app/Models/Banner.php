<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'image',
        'type',
        'url',
        'product_id',
        'page_id',
        'summary',
        'pages',
        'order',
        'active',
        'sw_title',
    ];

    protected $casts = [
        'active' => 'bool',
        'sw_title' => 'bool',
        'order' => 'integer',
        'pages' => 'array'
    ];

    protected $appends =['image_url', 'image_thumbs_url'];
    
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
            return asset(config('variables.folder_banner'). $imagePath);
        }
        return null;
    }
    
    public function getImageThumbsUrlAttribute()
    {
        if ($this->tecnical_image) {
            $imagePath = str_replace('storage/', '', $this->tecnical_image);
            return asset(config('variables.folder_banner'). config('variables.thumbs') . $imagePath);
        }
        return null;
    }


    public function getCategoryLabelAttribute(){
        
        $categories = Category::pluck('name', 'id');
        return $categories[$this->category_id] ?? ucfirst($this->category_id);
    }

    public function getSubcategoryLabelAttribute(){
        
        $categories = Subcategory::pluck('name', 'id');
        return $categories[$this->subcategory_id] ?? ucfirst($this->subcategory_id);
    }


}

