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

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg+xml">
        <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

        {{-- Fuentes no bloqueantes: se cargan en paralelo con el renderizado --}}
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
        <noscript><link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" rel="stylesheet" /></noscript>

        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
        <noscript><link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" /></noscript>

        {{-- TinyMCE Local Override: solo el panel admin usa el editor; la tienda no lo descarga --}}
        @if (str_starts_with($page['component'] ?? '', 'admin/'))
            <script src="/tinymce/tinymce-local-override.js" defer></script>
        @endif

        @viteReactRefresh
        @routes
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead

    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
