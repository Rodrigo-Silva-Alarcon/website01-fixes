<?php

namespace App\Traits;

use App\Services\WebContentService;

/**
 * Backward-compatible facade over WebContentService.
 * Controllers/middleware keep `use WebTrail;` while logic lives in the service.
 */
trait WebTrail
{
    private function webContent(): WebContentService
    {
        return app(WebContentService::class);
    }

    function get_menu()
    {
        return $this->webContent()->menu();
    }

    function get_populares()
    {
        return $this->webContent()->populares();
    }

    function get_detacados()
    {
        return $this->webContent()->destacados();
    }

    function get_marcas()
    {
        return $this->webContent()->marcas();
    }

    function get_banners($page)
    {
        return $this->webContent()->banners((string) $page);
    }

    function get_categories_home()
    {
        return $this->webContent()->categoriesHome();
    }

    function get_categories_home_all()
    {
        return $this->webContent()->categoriesHomeAll();
    }

    function get_category_slug($slug)
    {
        return $this->webContent()->categoryBySlug((string) $slug);
    }

    function get_subcategory_slug($slug, $slug_category)
    {
        return $this->webContent()->subcategoryBySlug((string) $slug, (string) $slug_category);
    }

    /**
     * @param  array<int, int|string>  $categories
     * @param  array<int, int|string>  $marcas
     */
    function get_products($categories = [], $subcategory = null, $marcas = [], $find = null)
    {
        return $this->webContent()->products(
            is_array($categories) ? $categories : [],
            $subcategory !== null ? (int) $subcategory : null,
            is_array($marcas) ? $marcas : [],
            $find !== null ? (string) $find : null,
        );
    }

    function get_product($product, $category, $subcategory = null)
    {
        return $this->webContent()->productDetail(
            (string) $product,
            (string) $category,
            $subcategory !== null ? (string) $subcategory : null,
        );
    }
}
