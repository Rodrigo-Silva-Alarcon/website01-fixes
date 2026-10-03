import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { Toaster } from '@/components/ui/sonner';
import NavigationLoader from '@/components/navigation-loader';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        // route() de ziggy-js lee la configuración global; en el navegador la pone
        // @routes, en el servidor llega como prop "ziggy" (ver HandleInertiaRequests).
        // Se asigna justo antes de renderToString (síncrono) para no mezclar peticiones.
        render: (app) => {
            (globalThis as Record<string, unknown>).Ziggy = page.props.ziggy;
            return ReactDOMServer.renderToString(app);
        },
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
        // Mismo árbol que app.tsx para que la hidratación coincida
        setup: ({ App, props }) => (
            <>
                <NavigationLoader />
                <App {...props} />
                <Toaster />
            </>
        ),
    }),
);
