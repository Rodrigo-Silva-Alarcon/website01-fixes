<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'image',
        'order',
        'active',
    ];

    protected $casts = [
        'active' => 'bool',
        'order' => 'integer',
    ];

    protected $appends =['image_url', 'image_url_thumbs'];


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
    
    public function getImageUrlThumbsAttribute()
    {
        if ($this->tecnical_image) {
            $imagePath = str_replace('storage/', '', $this->tecnical_image);
            return asset(config('variables.folder_banner'). $imagePath);
        }
        return null;
    }

}

