<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tighten\Ziggy\Ziggy;

class ExcludeAdminZiggyRoutes
{
    /**
     * §4.1.4 — No exponer rutas admin en el payload Ziggy del frontend público.
     * Se aplica en middleware (no en AppServiceProvider::boot) porque el path
     * del request real aún no existe al arrancar los providers en tests.
     */
    public function handle(Request $request, Closure $next): Response
    {
        Ziggy::clearRoutes();

        $needsAdminRoutes = $request->is('admin')
            || $request->is('admin/*')
            || $request->is('settings/*')
            || $request->is('user/*');

        if ($needsAdminRoutes) {
            config()->offsetUnset('ziggy.except');
        } else {
            config([
                'ziggy.except' => [
                    'admin.*',
                    'categories.*',
                    'subcategories.*',
                    'banners.*',
                    'brands.*',
                    'images.*',
                    'inventories.*',
                    'admin.carts.*',
                    'profile.*',
                    'password.edit',
                    'password.update',
                    'password.confirm',
                    'password.confirm.store',
                    'appearance',
                    'products.index',
                    'products.create',
                    'products.store',
                    'products.edit',
                    'products.update',
                    'products.destroy',
                    'products.show',
                    'products.reorder',
                    'products.toggle-publish',
                ],
            ]);
        }

        return $next($request);
    }
}
