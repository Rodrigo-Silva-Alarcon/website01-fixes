<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;
use App\Traits\WebTrait;
use App\Traits\ShopTrait;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */

    use WebTrait;
    use ShopTrait;

    public function share(Request $request): array
    {
        /* para la busqueda de los elementos */

        $rawCs = $request->cs;
        $cateories = is_array($rawCs) ? $rawCs : ($request->filled('cs') ? explode(',', (string) $rawCs) : []);
        $cateories = array_values(array_unique(array_filter(array_map('intval', $cateories))));

        if ($request->category && empty($cateories)) {
            $category = $this->get_category_slug($request->category);
            if ($category) {
                $cateories = [$category->id];
            }
        }

        $rawMs = $request->ms;
        $brands = is_array($rawMs) ? $rawMs : ($request->filled('ms') ? explode(',', (string) $rawMs) : []);
        $brands = array_values(array_unique(array_filter(array_map('intval', $brands))));

        if ($request->brand && empty($brands)) {
            $brandModel = is_numeric($request->brand) ? \App\Models\Brand::find($request->brand) : \App\Models\Brand::where('name', $request->brand)->first();
            if ($brandModel) {
                $brands = [$brandModel->id];
            } elseif (is_numeric($request->brand)) {
                $brands = [(int) $request->brand];
            }
        }

        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Solo cargar datos de tienda en rutas públicas (evita queries en admin)
        $isPublic = ! $request->is('admin*', 'login', 'register', 'password*', 'up');

        $base = [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ? $request->user()->load('roles.permissions') : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                'error' => fn () => $request->session()->get('error'),
                'success' => fn () => $request->session()->get('success'),
            ],
        ];

        // SSR solo para la tienda pública (primera pantalla en móvil). El panel admin
        // se sigue renderizando en el cliente. Si el servidor SSR no responde,
        // Inertia vuelve automáticamente al renderizado en el cliente.
        if (! $isPublic || $request->user()) {
            config(['inertia.ssr.enabled' => false]);
        } elseif (config('inertia.ssr.enabled') && ! $request->header('X-Inertia')) {
            // El servidor SSR no tiene el <script> de @routes: se le pasan las rutas
            // (ya filtradas por ExcludeAdminZiggyRoutes) solo en la carga inicial.
            $base['ziggy'] = fn () => [
                ...(new \Tighten\Ziggy\Ziggy)->toArray(),
                'location' => $request->url(),
            ];
        }

        if ($isPublic) {
            // Estimación del dispositivo para que el HTML de SSR use el mismo diseño
            // (teléfono / tablet / escritorio) que el navegador al hidratar
            $ua = (string) $request->userAgent();
            $base['uaDevice'] = preg_match('/iPad|Tablet|Android(?!.*Mobile)/i', $ua) ? 'tablet'
                : (preg_match('/Mobi|iPhone|Android/i', $ua) ? 'phone' : 'desktop');
            $base['menu'] = $this->get_menu();
            $base['populares'] = $this->get_populares();
            $base['cart'] = $cart = $this->get_shop_cart();
            // Diferido: solo se usa al abrir el carrito, así no engorda el HTML inicial.
            // Mientras llega, use-cart muestra "populares" como respaldo.
            $base['cartSuggestions'] = Inertia::defer(fn () => app(\App\Services\WebContentService::class)
                ->cartSuggestions($cart ? $cart->cartItems->pluck('product_id')->all() : []));
            $base['cates'] = $cateories;
            $base['marcas'] = $brands;
            $base['currentpage'] = $request->page??1;
            $base['find'] = $request->find??'';
            $base['cmsTexts'] = $this->get_cms_texts();
            $base['contact'] = $this->webContent()->contactInfo();
            $base['footer'] = $this->webContent()->footerInfo();
        } else {
            $base['menu'] = [];
            $base['populares'] = [];
            $base['cart'] = null;
            $base['cartSuggestions'] = [];
            $base['cates'] = [];
            $base['marcas'] = [];
            $base['currentpage'] = 1;
            $base['find'] = '';
            $base['cmsTexts'] = [];
            $base['contact'] = null;
            $base['footer'] = null;
        }

        return $base;
    }
}
