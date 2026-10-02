<?php

namespace App\Services;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Inventory;
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
                'subcategories' => fn ($q) => $q->where('active', true)->orderBy('order')->orderBy('id'),
            ])->where('active', true)->orderBy('order')->orderBy('id')->get();

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

    /**
     * Sugerencias del carrito: primero populares y luego el resto con stock,
     * sin repetir lo que ya está en el carrito.
     *
     * @param  array<int, int>  $exclude
     */
    public function cartSuggestions(array $exclude = [], int $limit = 10): Collection
    {
        return Product::with(['inventory', 'category', 'subcategory', 'brand'])
            ->where('active', true)
            ->whereNotIn('id', $exclude)
            ->whereHas('inventory', fn ($q) => $q->where('stock', '>', 0)->where('amount', '>', 0))
            ->orderByDesc('pop')->orderByDesc('featured')
            ->orderBy('order', 'ASC')->orderBy('id', 'DESC')
            ->limit($limit)
            ->get();
    }

    public function destacados(): Collection
    {
        return Cache::remember('web_destacados', 60, fn (): Collection => Product::with([
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
            return Banner::scheduled()
                ->where('pages', 'like', '%"' . $page . '"%')
                ->orderBy('order', 'ASC')
                ->orderBy('id', 'DESC')
                ->get();
        });
    }

    public function categoriesHome(): Collection
    {
        return Category::with('subcategories')
            ->withCount(['products' => fn ($query) => $query->where('active', true)])
            ->where('active', true)
            ->orderBy('order', 'ASC')
            ->orderBy('id', 'DESC')
            ->get();
    }

    public function categoriesHomeAll(): Collection
    {
        return Category::with([
            'products' => function ($query) {
                $query->with(['inventory', 'category', 'subcategory', 'brand'])
                    ->where('active', true)
                    ->orderBy('order', 'ASC')
                    ->orderBy('id', 'DESC')
                    ->limit(8);
            },
        ])->where('active', true)->orderBy('order', 'ASC')->orderBy('id', 'DESC')->get();
    }

    /**
     * Árbol de categorías → subcategorías activas con el número de productos publicados,
     * para el panel de filtros del listado.
     */
    public function categoryTree(): Collection
    {
        $published = fn ($q) => $q->where('active', true);

        return Category::where('active', true)
            ->withCount(['products' => $published])
            ->with(['subcategories' => fn ($q) => $q->where('active', true)
                ->withCount(['products' => $published])
                ->orderBy('order', 'ASC')->orderBy('id', 'ASC')])
            ->orderBy('order', 'ASC')->orderBy('id', 'DESC')
            ->get();
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
        array $subcategories = [],
        bool $offers = false,
        string $sort = 'rel',
    ): LengthAwarePaginator {
        $find = $find !== null ? trim($find) : null;
        $today = now()->toDateString();
        // Misma regla que productPrice()/isOnOffer() del frontend: oferta vigente si hay
        // ventana de fechas que incluye hoy y un offer_amount > 0.
        $offerActive = '(offer_amount > 0 AND (ini IS NOT NULL OR fin IS NOT NULL)'
            .' AND (ini IS NULL OR ini <= ?) AND (fin IS NULL OR fin >= ?))';

        $products = Product::where('active', true)
            ->select('products.*')
            ->with(['inventory', 'category', 'subcategory', 'brand'])
            // categorías y subcategorías marcadas suman resultados (OR), como en el árbol de filtros
            ->when(!empty($categories) || !empty($subcategories), fn ($query) => $query->where(function ($q) use ($categories, $subcategories) {
                $q->when(!empty($categories), fn ($w) => $w->whereIn('category_id', $categories))
                    ->when(!empty($subcategories), fn ($w) => $w->orWhereIn('subcategory_id', $subcategories));
            }))
            ->when($offers, fn ($query) => $query->whereHas('inventory', fn ($i) => $i->whereRaw($offerActive, [$today, $today])))
            ->when($subcategory !== null, fn ($query) => $query->where('subcategory_id', $subcategory))
            ->when(!empty($marcas), fn ($query) => $query->whereIn('brand_id', $marcas))
            ->when($find !== null && $find !== '', function ($query) use ($find) {
                $terms = array_filter(explode(' ', $find), fn ($w) => mb_strlen(trim($w)) > 0);
                $query->where(function ($q) use ($terms, $find) {
                    $q->where('name', 'like', '%' . $find . '%')
                        ->orWhere('summary', 'like', '%' . $find . '%')
                        ->orWhereHas('brand', fn ($b) => $b->where('name', 'like', '%' . $find . '%'))
                        ->orWhereHas('category', fn ($c) => $c->where('name', 'like', '%' . $find . '%'))
                        ->orWhereHas('subcategory', fn ($s) => $s->where('name', 'like', '%' . $find . '%'));

                    if (count($terms) > 1) {
                        $q->orWhere(function ($subQ) use ($terms) {
                            foreach ($terms as $term) {
                                $subQ->where(function ($wordQ) use ($term) {
                                    $wordQ->where('name', 'like', '%' . $term . '%')
                                        ->orWhere('summary', 'like', '%' . $term . '%')
                                        ->orWhereHas('brand', fn ($b) => $b->where('name', 'like', '%' . $term . '%'))
                                        ->orWhereHas('category', fn ($c) => $c->where('name', 'like', '%' . $term . '%'))
                                        ->orWhereHas('subcategory', fn ($s) => $s->where('name', 'like', '%' . $term . '%'));
                                });
                            }
                        });
                    }
                });
            })
            ->when(in_array($sort, ['asc', 'desc'], true), function ($query) use ($sort, $offerActive, $today) {
                $query->addSelect(['sort_price' => Inventory::selectRaw("CASE WHEN $offerActive THEN offer_amount ELSE amount END", [$today, $today])
                    ->whereColumn('product_id', 'products.id')->limit(1)])
                    ->orderByRaw('sort_price IS NULL')
                    ->orderBy('sort_price', $sort);
            })
            ->when($sort === 'off', function ($query) use ($offerActive, $today) {
                $query->addSelect(['sort_discount' => Inventory::selectRaw("CASE WHEN $offerActive AND amount > 0 THEN (amount - offer_amount) * 1.0 / amount ELSE 0 END", [$today, $today])
                    ->whereColumn('product_id', 'products.id')->limit(1)])
                    ->orderByDesc('sort_discount');
            })
            ->orderby('order', 'ASC')->orderBy('id', 'DESC')->paginate(20);

        if (request()->isMethod('post')) {
            $products->withPath(route('products'));
        }
        $products->appends(request()->only(['cs', 'ss', 'ms', 'offers', 'sort', 'find', 'category', 'subcategory', 'brand']));

        return $products;
    }

    public function productDetail(string $product, string $category, ?string $subcategory = null): ?Product
    {
        return Product::with(['images', 'inventory', 'category', 'subcategory', 'brand'])
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
