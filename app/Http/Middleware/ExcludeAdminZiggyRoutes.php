<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tighten\Ziggy\BladeRouteGenerator;
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
        // Cada request debe emitir Script completo (const Ziggy=...), no MergeScript;
        // el flag estatico persiste entre requests en tests/Octane.
        BladeRouteGenerator::$generated = false;

        // Autenticados siempre necesitan rutas admin (navegación SPA desde /login
        // no recarga el HTML, el payload Ziggy del request inicial persiste).
        // Páginas de auth (/login, /register, /password/*) también: el login es
        // un POST Inertia que redirige al dashboard sin recargar el HTML, por lo
        // que el Ziggy emitido en el GET de /login debe incluir rutas admin o
        // route('products.index') falla al montar el dashboard (pantalla en blanco).
        // Anónimos en / solo reciben rutas públicas.
        $needsAdminRoutes = auth()->check()
            || $request->is('admin')
            || $request->is('admin/*')
            || $request->is('settings/*')
            || $request->is('user/*')
            || $request->is('login')
            || $request->is('register')
            || $request->is('password/*');

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
