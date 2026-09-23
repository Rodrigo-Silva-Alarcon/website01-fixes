<?php

namespace App\Services;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Subcategory;
use App\Models\Text;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class WebContentService
{
    public function menu(): array
    {
        return Cache::remember('web_menu', 60, function (): array {
            $menu = [];
            $categories = Category::with([
                'subcategories' => fn ($q) => $q->where('active', true),
            ])->where('active', true)->get();

            foreach ($categories as $cate) {
                $item = [
                    'id' => $cate->slug,
                    'name' => $cate->name,
                    'icon' => $cate->icon,
                    'submenu' => [],
                ];
                foreach ($cate->subcategories as $sub) {
                    $item['submenu'][] = [
                        'id' => $sub->slug,
                        'name' => $sub->name,
                        'icon' => $sub->icon,
                    ];
                }
                $menu[] = $item;
            }

            return $menu;
        });
    }

    public function populares(): Collection
    {
        return Cache::remember('web_populares', 60, fn (): Collection => Product::with([
            'inventory', 'category', 'subcategory', 'brand',
        ])->where('active', true)->where('pop', true)->limit(8)->get());
    }

    public function destacados(): Collection
    {
        return Cache::remember('web_detacados', 60, fn (): Collection => Product::with([
            'inventory', 'category', 'subcategory', 'brand',
        ])->where('active', true)->where('featured', true)->limit(8)->get());
    }

    public function marcas(): Collection
    {
        return Cache::remember('web_marcas', 60, fn (): Collection => Brand::where('active', true)->limit(10)->get());
    }

    public function banners(string $page): Collection
    {
        return Cache::remember('web_banners_'.$page, 60, function () use ($page): Collection {
            return Banner::where('active', true)
                ->where('pages', 'like', '%"' . $page . '"%')
                ->orderBy('order', 'ASC')
                ->orderBy('id', 'DESC')
                ->get();
        });
    }

    public function categoriesHome(): Collection
    {
        return Category::with('subcategories')
            ->where('active', true)
            ->orderBy('order', 'ASC')
            ->orderBy('id', 'DESC')
            ->get();
    }

    public function categoriesHomeAll(): Collection
    {
        return Category::with([
            'products' => function ($query) {
                $query->with(['inventory', 'category', 'subcategory', 'brand'])->where('active', true);
            },
        ])->where('active', true)->orderBy('order', 'ASC')->orderBy('id', 'DESC')->get();
    }

    public function categoryBySlug(string $slug): ?Category
    {
        return Category::where('slug', $slug)->first();
    }

    public function subcategoryBySlug(string $slug, string $slugCategory): ?Subcategory
    {
        return Subcategory::where('slug', $slug)
            ->whereHas('category', fn ($q) => $q->where('slug', $slugCategory))
            ->first();
    }

    /**
     * @param  array<int, int|string>  $categories
     * @param  array<int, int|string>  $marcas
     */
    public function products(
        array $categories = [],
        ?int $subcategory = null,
        array $marcas = [],
        ?string $find = null,
    ): LengthAwarePaginator {
        $products = Product::where('active', true)
            ->with(['inventory', 'category', 'subcategory', 'brand'])
            ->when($categories, fn ($query, $cats) => $query->whereIn('category_id', $cats))
            ->when($subcategory, fn ($query, $sub) => $query->where('subcategory_id', $sub))
            ->when($marcas, fn ($query, $brands) => $query->whereIn('brand_id', $brands))
            ->when($find, function ($query, $needle) {
                $query->where(function ($q) use ($needle) {
                    $q->where('name', 'like', '%' . $needle . '%')
                        ->orWhere('summary', 'like', '%' . $needle . '%')
                        ->orWhere('description', 'like', '%' . $needle . '%');
                });
            })
            ->orderby('order', 'ASC')->orderBy('id', 'DESC')->paginate(20);

        if (request()->isMethod('post')) {
            $products->withPath(route('products'));
        }
        $products->appends(request()->only(['cs', 'ms', 'find', 'category', 'subcategory', 'brand']));

        return $products;
    }

    public function productDetail(string $product, string $category, ?string $subcategory = null): ?Product
    {
        return Product::with(['images', 'inventory'])
            ->where('slug', $product)
            ->where('active', true)
            ->whereHas('category', fn ($q) => $q->where('slug', $category))
            ->when($subcategory, function ($qr) use ($subcategory) {
                $qr->whereHas('subcategory', fn ($query) => $query->where('slug', $subcategory));
            })
            ->first();
    }

    /**
     * Published CMS texts as name => content for frontend consumption.
     *
     * @return array<string, string>
     */
    public function cmsTexts(): array
    {
        return Cache::remember('web_cms_texts', 60, function (): array {
            return Text::query()
                ->where('publish', true)
                ->get(['name', 'content'])
                ->filter(fn (Text $t) => filled($t->content))
                ->mapWithKeys(fn (Text $t) => [$t->name => (string) $t->content])
                ->all();
        });
    }
}
