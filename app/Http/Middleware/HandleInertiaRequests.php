<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
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

        $cateories = $request->cs??[];
        $brands = $request->ms??[];

        if($request->category){
            $category = $this->get_category_slug($request->category);
            if($category){
                $cateories = [$category->id];
            }
        }
        if($request->brand){
            $brands = [$request->brand];
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

        if ($isPublic) {
            $base['menu'] = $this->get_menu();
            $base['populares'] = $this->get_populares();
            $base['cart'] = $this->get_shop_cart();
            $base['cates'] = $cateories;
            $base['marcas'] = $brands;
            $base['currentpage'] = $request->page??1;
            $base['find'] = $request->find??'';
            $base['cmsTexts'] = $this->get_cms_texts();
        } else {
            $base['menu'] = [];
            $base['populares'] = [];
            $base['cart'] = null;
            $base['cates'] = [];
            $base['marcas'] = [];
            $base['currentpage'] = 1;
            $base['find'] = '';
            $base['cmsTexts'] = [];
        }

        return $base;
    }
}
