<?php

namespace App\Traits;

use Illuminate\Support\Facades\Hash;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Imagick\Driver;
use Illuminate\Support\Str;

use App\Models\Proyect;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Subcategory;
use App\Models\Category;
use App\Models\Product;

trait WebTrail {
    function get_menu(){
        $menu = array();
        $categories = Category::with(['subcategories' => function($query){
            $query->where('active', true);
        }])->where('active', true)->get();
        foreach($categories as $cate){
            $array = [
                'id' => $cate->slug,
                'name' => $cate->name,
                'icon' => $cate->icon,
            ];
            $array['submenu'] = [];
            foreach($cate->subcategories as $sub){
                $array['submenu'][] = [
                    'id' => $sub->slug,
                    'name' => $sub->name,
                    'icon' => $sub->icon,
                ];
            }
            $menu[] = $array;            
        }
        return $menu;
    }    

    function get_populares(){
        return Product::with('inventory')->where('active', true)->where('pop', true)->limit(8)->get();
    }
    function get_detacados(){
        return Product::where('active', true)->where('featured', true)->limit(8)->get();
    }
    function get_marcas(){
        return Brand::where('active', true)->limit(10)->get();
    }
    function get_banners($page){
        return Banner::where('active', true)->where('pages', 'like', '%"'.$page.'"%')->orderBy('order', 'ASC')->orderBy('id', 'DESC')->get();
    }

    function get_categories_home(){
        return Category::where('active', true)->orderBy('order', 'ASC')->orderBy('id', 'DESC')->get();
    }
    function get_categories_home_all(){
        return Category::with(['products' => function($query){
            $query->with('inventory')->where('active', true);
        }])->where('active', true)->orderBy('order', 'ASC')->orderBy('id', 'DESC')->get();
    }

    function get_category_slug($slug){
        return Category::where('slug', $slug)->first();
    }

    function get_subcategory_slug($slug, $slug_category){
        return Subcategory::where('slug', $slug)->whereHas('category', function($query) use ($slug_category){
            $query->where('slug', $slug_category);
        })->first();
    }
    
    function get_products($categories=[], $subcategory=NULL, $marcas=[], $find=NULL){
        $products = Product::where('active', true)
                ->with(['inventory', 'category', 'subcategory'])
                ->when($categories, function($query, $categories){
                    $query->whereIn('category_id', $categories);
                })
                ->when($subcategory, function($query, $subcategory){
                    $query->where('subcategory_id', $subcategory);
                })
                ->when($marcas, function($query, $marcas){
                    $query->whereIn('brand_id', $marcas);
                })
                ->when($find, function($query, $find){
                    $query->where(function($q) use ($find){
                        $q->where('name', 'like', '%'.$find.'%')->orWhere('summary', 'like', '%'.$find.'%')->orWhere('description', 'like', '%'.$find.'%');
                    });                    
                })
                ->orderby('order', 'ASC')->orderBy('id', 'DESC')->paginate(20);
        if (request()->isMethod('post')) {
            $products->withPath(route('products'));
        }
        return $products;
    }

    function get_product($product, $category, $subcategory=NULL){
        $product = Product::with(['images', 'inventory'])->where('slug', $product)->where('active', true)
        ->whereHas('category', function ($query) use ($category) {
            $query->where('slug', $category);
        })->when($subcategory, function($qr) use ($subcategory){
            $qr->whereHas('subcategory', function ($query) use ($subcategory) {
                $query->where('slug', $subcategory);
            });
        });                
        
        return $product->first();
    }
}

?>