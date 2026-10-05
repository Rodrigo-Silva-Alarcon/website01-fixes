<?php

namespace App\Services;

use App\Models\AboutImage;
use App\Models\AboutPage;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\HomeSection;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Subcategory;
use App\Models\Text;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class WebContentService
{
    /** Páginas del CMS a las que se puede asignar un banner (TYPE_PAGES del panel). */
    public const BANNER_PAGES = ['1', '2', '3', '4'];

    /**
     * Campos que solo usa la ficha del producto. En listados y tarjetas se ocultan
     * para no inflar el HTML/JSON inicial de cada página (sobre todo en móvil).
     */
    private const CARD_HIDDEN = [
        'description', 'technical_info', 'tecnical_image', 'tecnical_image_url', 'tecnical_image_thumbs_url',
        'video_type', 'video_file', 'video_url', 'video_iframe', 'video_file_url', 'created_at', 'updated_at',
    ];

    /**
     * @template T of Collection
     * @param  T  $products
     * @return T
     */
    private function forCards(Collection $products): Collection
    {
        return $products->each(fn (Product $p) => $p->makeHidden(self::CARD_HIDDEN));
    }

    /**
     * Borra la caché pública para que lo que se cambia en el panel se vea al instante.
     */
    public static function flushCache(): void
    {
        foreach (['web_menu', 'web_populares', 'web_destacados', 'web_marcas', 'web_cms_texts', 'web_about', 'web_home_sections'] as $key) {
            Cache::forget($key);
        }
        foreach (self::BANNER_PAGES as $page) {
            Cache::forget('web_banners_'.$page);
        }
    }

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
        return $this->forCards(Cache::remember('web_populares', 60, fn (): Collection => Product::with([
            'inventory', 'category', 'subcategory', 'brand',
        ])->where('active', true)->where('pop', true)
            ->orderBy('order', 'ASC')->orderBy('id', 'DESC')->limit(8)->get()));
    }

    /**
     * Sugerencias del carrito: primero populares y luego el resto con stock,
     * sin repetir lo que ya está en el carrito.
     *
     * @param  array<int, int>  $exclude
     */
    public function cartSuggestions(array $exclude = [], int $limit = 10): Collection
    {
        return $this->forCards(Product::with(['inventory', 'category', 'subcategory', 'brand'])
            ->where('active', true)
            ->whereNotIn('id', $exclude)
            ->whereHas('inventory', fn ($q) => $q->where('stock', '>', 0)->where('amount', '>', 0))
            ->orderByDesc('pop')->orderByDesc('featured')
            ->orderBy('order', 'ASC')->orderBy('id', 'DESC')
            ->limit($limit)
            ->get());
    }

    public function destacados(): Collection
    {
        return $this->forCards(Cache::remember('web_destacados', 60, fn (): Collection => Product::with([
            'inventory', 'category', 'subcategory', 'brand',
        ])->where('active', true)->where('featured', true)
            ->orderBy('order', 'ASC')->orderBy('id', 'DESC')->limit(8)->get()));
    }

    public function marcas(): Collection
    {
        return Cache::remember('web_marcas', 60, fn (): Collection => Brand::where('active', true)
            ->orderBy('order', 'ASC')->orderBy('id', 'DESC')->limit(10)->get());
    }

    public function banners(string $page): Collection
    {
        $banners = Cache::remember('web_banners_'.$page, 60, function () use ($page): Collection {
            return Banner::scheduled()
                ->with(['product' => fn ($q) => $q->where('active', true)->with(['category', 'subcategory'])])
                ->where('pages', 'like', '%"' . $page . '"%')
                ->orderBy('order', 'ASC')
                ->orderBy('id', 'DESC')
                ->get();
        });

        // Solo lo que el carrusel necesita: imagen, textos y a dónde lleva el clic.
        return $banners->map(fn (Banner $b) => [
            'id' => $b->id,
            'name' => $b->name,
            'summary' => $b->summary,
            'sw_title' => (bool) $b->sw_title,
            'image_url' => $b->image_url,
            'image_webp_url' => $b->image_webp_url,
            'link' => $b->link,
            // URL externa (tipo 3 hacia otro dominio): se abre en otra pestaña.
            'external' => (string) $b->type === '3' && filled($b->url)
                && ! str_starts_with($b->url, '/') && ! str_starts_with($b->url, rtrim(url('/'), '/')),
        ])->filter(fn (array $b) => filled($b['image_url']))->values();
    }

    /**
     * Secciones visibles de la página de inicio, en orden, con los productos ya resueltos
     * (solo campos de tarjeta). Lo que no tiene productos para mostrar se omite.
     *
     * @return array<int, array<string, mixed>>
     */
    public function homeSections(): array
    {
        return Cache::remember('web_home_sections', 60, function (): array {
            $sections = HomeSection::where('active', true)->orderBy('position')->orderBy('id')->get();
            $result = [];

            foreach ($sections as $section) {
                $item = [
                    'id' => $section->id,
                    'type' => $section->type,
                    'title' => $section->title,
                    'subtitle' => $section->subtitle,
                ];

                if ($section->type === 'products') {
                    $item['products'] = $this->sectionProducts($section)->values()->all();
                    $item['link'] = $this->sectionLink($section);
                    if (empty($item['products'])) {
                        continue;
                    }
                } elseif ($section->type === 'promo') {
                    $products = $this->productsByIds($section->productIds());
                    if ($products->count() < 2) {
                        // Si falta alguno (despublicado o eliminado) se completa como antes: destacados y luego populares
                        $fill = $this->destacados()->concat($this->populares())->unique('id')
                            ->reject(fn (Product $p) => $products->contains('id', $p->id));
                        $products = $products->concat($fill)->take(2);
                    }
                    if ($products->isEmpty()) {
                        continue;
                    }
                    $item['products'] = $products->values()->all();
                }

                $result[] = $item;
            }

            return $result;
        });
    }

    /** Productos de una sección de tipo "products" según su origen. */
    public function sectionProducts(HomeSection $section): Collection
    {
        $settings = $section->settings ?? [];
        $source = $settings['source'] ?? 'popular';
        $limit = max(1, min(HomeSection::MAX_PRODUCTS, (int) ($settings['limit'] ?? 8)));

        if ($source === 'manual') {
            return $this->productsByIds(array_slice($section->productIds(), 0, HomeSection::MAX_PRODUCTS));
        }

        $today = now()->toDateString();
        $query = Product::with(['inventory', 'category', 'subcategory', 'brand'])->where('active', true);

        match ($source) {
            'featured' => $query->where('featured', true)->orderBy('order')->orderByDesc('id'),
            'offers' => $query->whereHas('inventory', fn ($i) => $i->where('offer_amount', '>', 0)
                ->where(fn ($w) => $w->whereNotNull('ini')->orWhereNotNull('fin'))
                ->where(fn ($w) => $w->whereNull('ini')->orWhere('ini', '<=', $today))
                ->where(fn ($w) => $w->whereNull('fin')->orWhere('fin', '>=', $today)))
                ->orderBy('order')->orderByDesc('id'),
            'latest' => $query->orderByDesc('id'),
            'category' => $query->where('category_id', (int) ($settings['category_id'] ?? 0))->orderBy('order')->orderByDesc('id'),
            default => $query->where('pop', true)->orderBy('order')->orderByDesc('id'),
        };

        return $this->forCards($query->limit($limit)->get());
    }

    /** Productos publicados en el orden exacto de los ids recibidos. */
    private function productsByIds(array $ids): Collection
    {
        if (empty($ids)) {
            return collect();
        }

        $products = Product::with(['inventory', 'category', 'subcategory', 'brand'])
            ->where('active', true)->whereIn('id', $ids)->get()->keyBy('id');

        return $this->forCards(collect($ids)->map(fn ($id) => $products->get($id))->filter()->values());
    }

    /** Destino del botón "Ver más" de una sección de productos. */
    private function sectionLink(HomeSection $section): ?string
    {
        $settings = $section->settings ?? [];

        return match ($settings['source'] ?? null) {
            'category' => ($slug = Category::whereKey((int) ($settings['category_id'] ?? 0))->value('slug'))
                ? route('category', ['category' => $slug], false) : null,
            'offers' => route('products', ['offers' => 1], false),
            default => null,
        };
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
        ])->where('active', true)->orderBy('order', 'ASC')->orderBy('id', 'DESC')->get()
            ->each(fn (Category $c) => $this->forCards($c->products));
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
        $this->forCards($products->getCollection());

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

    /**
     * Contenido de "Nosotros" editable desde Admin › Nosotros: textos + galería ordenada.
     * Las URLs llevan ?v= con la fecha de edición para que el navegador no muestre una foto vieja.
     *
     * @return array<string, mixed>|null
     */
    public function aboutContent(): ?array
    {
        return Cache::remember('web_about', 3600, function (): ?array {
            $page = AboutPage::first();
            if (! $page) {
                return null;
            }

            return [
                'title' => $page->title,
                'title_highlight' => $page->title_highlight,
                'intro' => $page->intro,
                'mission_title' => $page->mission_title,
                'mission' => $page->mission,
                'vision_title' => $page->vision_title,
                'vision' => $page->vision,
                'gallery' => AboutImage::orderBy('position')->get()->map(fn (AboutImage $image) => $image->toPublicArray())->all(),
            ];
        });
    }
}
