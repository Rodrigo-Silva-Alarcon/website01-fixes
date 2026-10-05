import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import type { ManualChunkMeta } from 'rollup';
import { defineConfig } from 'vite';

// Vite normaliza los ids de módulo con "/" también en Windows
const VENDOR_REACT = /\/node_modules\/(react|react-dom|scheduler|@inertiajs)\//;
const APP_ENTRY = /\/resources\/js\/app\.tsx$/;
const WEB_PAGE = /\/resources\/js\/pages\/web\/[^/]+\.tsx$/;
const WEB_LAYOUT = /\/resources\/js\/pages\/web\/layouts\/Layout\.tsx$/;
const HOME_PAGE = /\/resources\/js\/pages\/web\/HomePage\.tsx$/;
const OTHER_PAGE = /\/resources\/js\/pages\/(?!web\/).+\.tsx$/;

type Groups = { core: Set<string>; shared: Set<string>; web: Set<string> };
let groupsCache: Groups | null = null;

/** Módulos alcanzables desde las raíces siguiendo solo imports estáticos. */
function reachable({ getModuleIds, getModuleInfo }: ManualChunkMeta, isRoot: (id: string) => boolean, follow: (id: string) => boolean): Set<string> {
    const seen = new Set<string>();
    const queue = [...getModuleIds()].filter(isRoot);
    while (queue.length) {
        const id = queue.pop()!;
        if (seen.has(id) || !follow(id)) continue;
        seen.add(id);
        queue.push(...(getModuleInfo(id)?.importedIds ?? []));
    }
    return seen;
}

/**
 * Reparto del código de la tienda en pocos chunks (antes ~60 archivos de 1–3 KB en el inicio):
 * - core: todo lo que carga app.tsx en cualquier página (app.js queda como entrada mínima).
 * - shared: lo que la tienda comparte con el panel/login, para que estos no carguen "web".
 * - web: lo exclusivo del layout de la tienda y del inicio (cabecera, footer, carrito, secciones)
 *   con sus iconos de lucide. Su CSS (globals.css de la tienda) nunca llega al panel.
 * React, Inertia y todo lo que ellos importan (axios, qs...) se quedan en vendor-react: así ningún
 * grupo es dependencia de vendor-react y no se forman ciclos entre chunks. Rollup mete en un chunk
 * manual las dependencias sin chunk asignado, por eso cada grupo incluye también sus librerías.
 */
function chunkGroups(meta: ManualChunkMeta): Groups {
    if (groupsCache) return groupsCache;
    const notCss = (id: string) => !id.endsWith('.css');
    const vendorReact = reachable(meta, (id) => VENDOR_REACT.test(id), notCss);
    const core = reachable(meta, (id) => APP_ENTRY.test(id), notCss);
    core.forEach((id) => (APP_ENTRY.test(id) || vendorReact.has(id)) && core.delete(id));
    const fromOther = reachable(meta, (id) => OTHER_PAGE.test(id), notCss);
    // Las raíces de la tienda solo aportan dependencias; las páginas siguen siendo chunks propios
    const fromWeb = reachable(meta, (id) => WEB_LAYOUT.test(id) || HOME_PAGE.test(id), notCss);
    const shared = new Set<string>();
    const web = new Set<string>();
    for (const id of fromWeb) {
        if (vendorReact.has(id) || core.has(id) || (WEB_PAGE.test(id) && !WEB_LAYOUT.test(id))) continue;
        if (fromOther.has(id)) shared.add(id);
        else web.add(id);
    }
    return (groupsCache = { core, shared, web });
}

export default defineConfig(({ isSsrBuild }) => ({
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: {
            host: '127.0.0.1',
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/css/admin.css', 'resources/js/app.tsx'],
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
                // En el bundle SSR (Node) el reparto en chunks no aporta nada: se deja el de Rollup
                manualChunks: isSsrBuild ? undefined : (id: string, meta: ManualChunkMeta) => {
                    if (id.includes('node_modules')) {
                        if (id.includes('tinymce') || id.includes('@tinymce')) return 'vendor-tinymce';
                        if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'vendor-charts';
                        if (id.includes('framer-motion') || id.includes('aos')) return 'vendor-motion';
                        // Núcleo común a todas las páginas en un chunk estable (bien cacheable)
                        if (/[\\/]node_modules[\\/](react|react-dom|scheduler|@inertiajs)[\\/]/.test(id)) return 'vendor-react';
                        // El resto (Radix, dnd-kit, zod, react-hook-form...) lo reparte Rollup según
                        // qué páginas lo importan: la tienda no descarga librerías que solo usa el panel admin
                    }
                    const { core, shared, web } = chunkGroups(meta);
                    if (core.has(id)) return 'core';
                    if (shared.has(id)) return 'shared';
                    if (web.has(id)) return 'web';
                },
            },
        },
    },
}));
