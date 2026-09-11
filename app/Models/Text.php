<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Text extends Model
{
    protected $fillable = [
        'name',
        'date',
        'gender',
        'type',
        'print_view',
        'image',
        'summary',
        'content',
        'publish',
        'sector',
    ];

    protected $casts = [
        'date' => 'date',
        'type' => 'array',
        'publish' => 'boolean',
    ];

    public function getSectorLabelAttribute()
    {
        $sectors = config('variables.permission_sectors', []);
        return $sectors[$this->sector] ?? ucfirst($this->sector);
    }

    public function scopeBySector($query, $sector)
    {
        return $query->where('sector', $sector);
    }

    public function scopePublicados($query)
    {
        return $query->where('publish', true);
    }

    public function scopeNoPublicados($query)
    {
        return $query->where('publish', false);
    }

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            // Asegurar que la ruta no contenga 'storage/'
            $imagePath = str_replace('storage/', '', $this->image);
            return asset($imagePath);
        }
        return null;
    }

    public function getTypeLabelsAttribute()
    {
        $types = [
            'report' => 'Report',
            'article' => 'Article',
            'news' => 'News',
        ];

        return collect($this->type)->map(function ($type) use ($types) {
            return $types[$type] ?? ucfirst($type);
        })->join(', ');
    }

    public function getGenderLabelAttribute()
    {
        $genders = [
            'male' => 'Male',
            'female' => 'Female',
        ];

        return $genders[$this->gender] ?? ucfirst($this->gender);
    }

    public function getPrintViewLabelAttribute()
    {
        $views = [
            'letter' => 'Letter',
            'a4' => 'A4',
            'legal' => 'Legal',
            'legal_size' => 'Legal Size',
        ];

        return $views[$this->print_view] ?? ucfirst($this->print_view);
    }
}

