<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" style="color-scheme: light">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        {{-- El sitio siempre se muestra en modo claro, aunque el sistema este en modo oscuro --}}
        <meta name="color-scheme" content="light only">

        <style>
            html {
                background-color: oklch(1 0 0);
                color-scheme: light;
            }
            html.sf-dark {
                background-color: #0e1113;
            }
        </style>

        {{-- Modo oscuro de la tienda: se aplica antes de pintar para evitar el destello blanco --}}
        <script>
            try {
                if (localStorage.getItem('sf-theme') === 'dark') {
                    document.documentElement.classList.add('sf-dark');
                }
            } catch (e) {}
        </script>


        <link rel="icon" href="{{ asset('favicon.ico') }}" sizes="any">
        <link rel="icon" href="{{ asset('favicon-32.png') }}" type="image/png" sizes="32x32">
        <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

        {{-- Fuentes no bloqueantes: se cargan en paralelo con el renderizado.
             Una sola petición con las versiones variables (400–700) de las dos familias que usa el
             sitio: 2 archivos (~67 KB) en vez de 4 (~116 KB) repartidos entre dos proveedores. --}}
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400..700&family=Instrument+Sans:wght@400..700&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
        <noscript><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400..700&family=Instrument+Sans:wght@400..700&display=swap" rel="stylesheet" /></noscript>

        {{-- TinyMCE Local Override: solo el panel admin usa el editor; la tienda no lo descarga --}}
        @if (str_starts_with($page['component'] ?? '', 'admin/'))
            <script src="/tinymce/tinymce-local-override.js" defer></script>
        @endif

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        {{-- La tienda usa solo app.css (ligero); el resto de páginas también la hoja completa --}}
        @unless (str_starts_with($page['component'] ?? '', 'web/'))
            @vite('resources/css/admin.css')
        @endunless
        {{-- Antes de @routes (~23 KB de rutas en línea): así el preload de la imagen LCP del hero
             se descubre en los primeros KB del HTML --}}
        @inertiaHead
        @routes
        {{-- Con SSR el <title> llega en @inertiaHead; sin SSR se usa este por defecto --}}
        @if (empty($__inertiaSsrResponse))
            <title inertia>{{ config('app.name', 'Laravel') }}</title>
        @endif

    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
