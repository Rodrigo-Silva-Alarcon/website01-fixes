<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $path = $request->path();
        $isAsset = str_starts_with($path, 'data/')
            || str_starts_with($path, 'build/')
            || str_starts_with($path, 'storage/')
            || str_starts_with($path, 'views/')
            || preg_match('/\.(js|css|jpg|jpeg|png|gif|svg|webp|ico|woff2?)$/i', $path) === 1;

        if ($isAsset && $response->isSuccessful()) {
            $response->headers->set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
        } elseif ($path === 'sitemap.xml') {
            $response->headers->set('Cache-Control', 'public, max-age=3600');
        } elseif ($request->isMethod('GET') && !$request->is('admin*', 'login', 'register', 'up')) {
            // Inertia HTML: revalidar cada visita pero permitir cache corta de red
            if (!$response->headers->hasCacheControlDirective('no-store')) {
                $response->headers->set('Cache-Control', 'private, max-age=0, must-revalidate');
            }
        }

        return $response;
    }
}
