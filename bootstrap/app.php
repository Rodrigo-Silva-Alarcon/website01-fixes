<?php

use App\Http\Middleware\CacheHeaders;
use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\ExcludeAdminZiggyRoutes;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Render termina TLS en su proxy: confiar en X-Forwarded-* para que
        // Laravel genere URLs https (si no, el navegador bloquea los assets).
        $middleware->trustProxies(at: '*');

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            ExcludeAdminZiggyRoutes::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            CacheHeaders::class,
            SecurityHeaders::class,
        ]);

        // Registrar middleware personalizados
        $middleware->alias([
            'role' => CheckRole::class,
            'permission' => CheckPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Token CSRF vencido (pestaña abierta mucho tiempo): volver al login con aviso
        $exceptions->respond(function ($response, $exception, $request) {
            if ($response->getStatusCode() === 419 && $request->routeIs('login.store')) {
                return back()->withErrors([
                    'email' => 'Tu sesión expiró por inactividad. Vuelve a ingresar tus credenciales.',
                ]);
            }

            return $response;
        });
    })->create();
