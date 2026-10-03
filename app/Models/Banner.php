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
        'start_date',
        'end_date',
        'sw_title',
    ];

    protected $casts = [
        'active' => 'bool',
        'sw_title' => 'bool',
        'order' => 'integer',
        'pages' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    protected $appends =['image_url', 'image_thumbs_url', 'image_webp_url'];

    public function scopePublicados($query)
    {
        return $query->where('active', true);
    }

    public function scopeScheduled($query)
    {
        $today = now()->toDateString();

        return $query
            ->where('active', true)
            ->where(function ($q) use ($today) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', $today);
            })
            ->where(function ($q) use ($today) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', $today);
            });
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

    public function getImageWebpUrlAttribute()
    {
        if ($this->image) {
            $imagePath = str_replace('storage/', '', $this->image);
            $path = config('variables.folder_banner') . $imagePath;
            $webp = preg_replace('/\.[^.]+$/', '.webp', $path);
            if (is_file(public_path($webp))) {
                return asset($webp);
            }
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
        if ($this->relationLoaded('category') && $this->category) {
            return $this->category->name;
        }
        static $categories = null;
        if ($categories === null) {
            $categories = Category::pluck('name', 'id');
        }
        return $categories[$this->category_id] ?? ucfirst((string) $this->category_id);
    }

    public function getSubcategoryLabelAttribute(){
        if ($this->relationLoaded('subcategory') && $this->subcategory) {
            return $this->subcategory->name;
        }
        static $categories = null;
        if ($categories === null) {
            $categories = Subcategory::pluck('name', 'id');
        }
        return $categories[$this->subcategory_id] ?? ucfirst((string) $this->subcategory_id);
    }

    /**
     * Destino del banner según su tipo en el panel:
     * 1 = página, 2 = producto, 3 = URL externa; cualquier otro valor = sin enlace.
     */
    public function getLinkAttribute(): ?string
    {
        switch ((string) $this->type) {
            case '1':
                return match ((string) $this->page_id) {
                    '1' => route('home'),
                    '2' => route('about'),
                    '3' => route('products', ['offers' => 1]),
                    '4' => route('contact'),
                    default => null,
                };
            case '2':
                $product = $this->relationLoaded('product') ? $this->product : $this->product()->where('active', true)->first();
                if (! $product || ! $product->category) {
                    return null;
                }

                return route('product', [
                    'category' => $product->category->slug,
                    'subcategory' => $product->subcategory?->slug ?? 'All',
                    'product' => $product->slug,
                ]);
            case '3':
                return filled($this->url) ? $this->url : null;
            default:
                return null;
        }
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

