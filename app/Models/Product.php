<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'subcategory_id',
        'brand_id',
        'name',
        'slug',
        'image',
        'summary',
        'general_info',
        'description',
        'tecnical_info',
        'tecnical_image',
        'video_type',
        'video_file',
        'video_url',
        'video_iframe',
        'active',
        'featured',
        'pop',
        'order',
    ];

    protected $casts = [
        'active' => 'bool',
        'featured' => 'bool',
        'pop' => 'bool',
        'order' => 'integer',
    ];

    protected $appends =[
        'image_url', 
        'image_thumbs_url', 
        'tecnical_image_url', 
        'tecnical_image_thumbs_url', 
        'video_file_url',
        'category_label',
        'category_slug',
        'subcategory_label',
        'subcategory_slug',
        'brand_label'
    ];

    public function setNameAttribute($value){
        $this->attributes['name'] = $value;
        $this->attributes['slug'] = ucwords(Str::slug($value));
    }
    
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class);
    }
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function inventory(){
        return $this->hasOne(Inventory::class, 'product_id', 'id');
    }

    public function inventories(){     
        return $this->hasMany(Inventory::class);    
    }
    
    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imagetable');
    }

    public function files()
    {
        return $this->morphMany(File::class, 'filetable');
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
            return asset(config('variables.folder_product') . $imagePath);
            //return asset($imagePath);
        }
        return null;
    }
    public function getImageThumbsUrlAttribute()
    {
        if ($this->image) {
            $imagePath = str_replace('storage/', '', $this->image);
            return asset(config('variables.folder_product') .config('variables.thumbs') . $imagePath);
            //return asset($imagePath);
        }
        return null;
    }
    
    public function getTecnicalImageUrlAttribute()
    {
        if ($this->tecnical_image) {
            $imagePath = str_replace('storage/', '', $this->tecnical_image);
            return asset(config('variables.folder_product') . $imagePath);
            //return asset($imagePath);
        }
        return null;
    }
    public function getTecnicalImageThumbsUrlAttribute()
    {
        if ($this->tecnical_image) {
            $imagePath = str_replace('storage/', '', $this->tecnical_image);
            return asset(config('variables.folder_product') .config('variables.thumbs') . $imagePath);
            //return asset($imagePath);
        }
        return null;
    }

    public function getVideoFileUrlAttribute()
    {
        if ($this->video_file) {
            $videoPath = str_replace('storage/', '', $this->video_file);
            return asset(config('variables.folder_video') . $videoPath);
            //return asset($imagePath);
        }
        return null;
    }

    public function getCategoryLabelAttribute(){
        
        $categories = Category::pluck('name', 'id');
        return $categories[$this->category_id] ?? ucfirst($this->category_id);
    }        
    
    public function getCategorySlugAttribute(){        
        $categories = Category::pluck('slug', 'id');
        return $categories[$this->category_id] ?? ucfirst($this->category_id);
    }

    public function getSubcategoryLabelAttribute(){        
        $categories = Subcategory::pluck('name', 'id');
        return $categories[$this->subcategory_id] ?? ucfirst($this->subcategory_id);
    }

    public function getSubcategorySlugAttribute(){
        
        $categories = Subcategory::pluck('slug', 'id');
        return $categories[$this->subcategory_id] ?? ucfirst($this->subcategory_id);
    }


    public function getBrandLabelAttribute(){        
        $brands = Brand::pluck('name', 'id');
        return $brands[$this->brand_id] ?? ucfirst($this->brand_id);
    }
}

