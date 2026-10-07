<?php

namespace App\Providers;

use App\Services\WebContentService;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
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

        // Rutas de Vite relativas a la raíz ("/build/assets/..."): el cargador de chunks de Vite
        // busca link[href="/build/assets/x.css"] para no repetir el CSS que ya está en el HTML.
        // Con la URL absoluta no lo encontraba, pedía web.css otra vez y esperaba a que llegara
        // antes de pintar la página.
        Vite::createAssetPathsUsing(fn (string $path) => '/'.ltrim($path, '/'));

        // Password policy (5.1.6): min 8, letters and numbers
        Password::defaults(function () {
            return Password::min(8)
                ->letters()
                ->numbers();
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
