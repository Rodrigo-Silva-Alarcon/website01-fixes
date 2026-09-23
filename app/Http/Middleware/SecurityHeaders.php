<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $path = $request->path();
        $isAsset = str_starts_with($path, 'data/')
            || str_starts_with($path, 'build/')
            || str_starts_with($path, 'storage/')
            || preg_match('/\.(js|css|jpg|jpeg|png|gif|svg|webp|ico|woff2?)$/i', $path) === 1;

        if ($isAsset) {
            return $response;
        }

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(), payment=()'
        );

        $contentType = (string) $response->headers->get('Content-Type', '');
        if ($response->isSuccessful() && str_contains($contentType, 'text/html')) {
            $csp = implode('; ', [
                "default-src 'self'",
                "base-uri 'self'",
                "object-src 'none'",
                "frame-ancestors 'self'",
                "form-action 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' data: https://fonts.gstatic.com",
                "img-src 'self' data: blob:",
                "media-src 'self'",
                "connect-src 'self' ws: wss:",
            ]);

            $response->headers->set('Content-Security-Policy', $csp);
        }

        return $response;
    }
}
