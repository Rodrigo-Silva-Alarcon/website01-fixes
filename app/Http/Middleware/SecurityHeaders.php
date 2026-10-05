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
            'camera=(), microphone=(), geolocation=(self), payment=()'
        );

        $contentType = (string) $response->headers->get('Content-Type', '');
        if ($response->isSuccessful() && str_contains($contentType, 'text/html')) {
            $styleSrc = "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net";
            $fontSrc = "font-src 'self' data: https://fonts.gstatic.com https://fonts.bunny.net";
            $scriptSrc = "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
            $connectSrc = "connect-src 'self' ws: wss: https://nominatim.openstreetmap.org";

            // Vite HMR: public/hot existe solo en local
            $hotFile = public_path('hot');
            if (is_file($hotFile)) {
                $hotOrigin = rtrim((string) file_get_contents($hotFile));
                if ($hotOrigin !== '' && preg_match('#^https?://#i', $hotOrigin) === 1) {
                    $scriptSrc .= ' '.$hotOrigin;
                    $styleSrc .= ' '.$hotOrigin;
                    $connectSrc .= ' '.$hotOrigin;
                    $fontSrc .= ' '.$hotOrigin;
                }
            }

            $csp = implode('; ', [
                "default-src 'self'",
                "base-uri 'self'",
                "object-src 'none'",
                "frame-ancestors 'self'",
                "form-action 'self'",
                $scriptSrc,
                $styleSrc,
                $fontSrc,
                "img-src 'self' data: blob: https://tile.openstreetmap.org",
                "media-src 'self'",
                "frame-src 'self' https://www.google.com https://maps.google.com https://maps.googleapis.com",
                $connectSrc,
            ]);

            $response->headers->set('Content-Security-Policy', $csp);
        }

        return $response;
    }
}
