<?php

namespace App\Providers;

use App\Services\WebContentService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // Password policy (5.1.6): min 8, letters and numbers
        Password::defaults(function () {
            return Password::min(8)
                ->letters()
                ->numbers();
        });

        // Límite de envíos del checkout por sesión (evita spam/doble submit)
        RateLimiter::for('checkout', function (Request $request) {
            return Limit::perMinute(20)->by($request->session()->getId());
        });

        // Lo que se edita en el panel (banners, catálogo, textos) se refleja en la web al instante.
        $models = [
            \App\Models\Banner::class,
            \App\Models\Brand::class,
            \App\Models\Category::class,
            \App\Models\Subcategory::class,
            \App\Models\Product::class,
            \App\Models\Inventory::class,
            \App\Models\Text::class,
            \App\Models\HomeSection::class,
        ];
        foreach ($models as $model) {
            $model::saved(fn () => WebContentService::flushCache());
            $model::deleted(fn () => WebContentService::flushCache());
        }
    }
}
