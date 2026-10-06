<?php

use App\Models\Banner;
use App\Services\WebContentService;
use Illuminate\Database\Migrations\Migration;

/**
 * Los banners solo se muestran en el carrusel de Inicio. Se quitan las páginas antiguas
 * (Nosotros, Ofertas, Contáctanos) sin mover nada a Inicio: un banner que no estaba en
 * Inicio sigue sin mostrarse hasta que se vuelva a guardar desde el panel.
 */
return new class extends Migration
{
    public function up(): void
    {
        Banner::query()->each(function (Banner $banner): void {
            $pages = array_values(array_intersect(array_map('strval', $banner->pages ?? []), WebContentService::BANNER_PAGES));
            if ($pages !== ($banner->pages ?? [])) {
                $banner->pages = $pages;
                $banner->saveQuietly();
            }
        });

        WebContentService::flushCache();
    }

    public function down(): void
    {
        // Las páginas quitadas no se pueden recuperar.
    }
};
