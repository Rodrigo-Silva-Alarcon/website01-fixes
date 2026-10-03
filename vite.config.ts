import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: {
            host: '127.0.0.1',
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    // El bundle SSR incluye sus dependencias: en la imagen Docker no hay node_modules
    ssr: {
        noExternal: true,
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('tinymce') || id.includes('@tinymce')) return 'vendor-tinymce';
                        if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'vendor-charts';
                        if (id.includes('framer-motion') || id.includes('aos')) return 'vendor-motion';
                        // Núcleo común a todas las páginas en un chunk estable (bien cacheable)
                        if (/[\\/]node_modules[\\/](react|react-dom|scheduler|@inertiajs)[\\/]/.test(id)) return 'vendor-react';
                        // El resto (Radix, dnd-kit, zod, react-hook-form...) lo reparte Rollup según
                        // qué páginas lo importan: la tienda no descarga librerías que solo usa el panel admin
                    }
                },
            },
        },
    },
});
