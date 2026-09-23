<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Image extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'original_name',
        'imagetable_type',
        'imagetable_id',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    protected $appends = ['image_url'];

    public function imagetable(): MorphTo
    {
        return $this->morphTo();
    }

    public function getImageUrlAttribute(){
        if ($this->name) {
            $imagePath = str_replace('storage/', '', $this->name);
            return asset(config('variables.folder_image'). $imagePath);            
        }
        return null;
    }
}