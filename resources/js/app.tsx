import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { Toaster } from '@/components/ui/sonner';
import NavigationLoader from '@/components/navigation-loader';
import { registerHttpErrorToasts } from '@/lib/http-errors';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';


createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: async (name) => {
        // app.css solo trae las utilidades de la tienda; el resto de páginas (admin, login...)
        // necesitan la hoja completa. Se espera a que cargue para no pintar sin estilos
        // (también al navegar de la tienda al panel sin recargar).
        if (!name.startsWith('web/')) await import('../css/admin.css');
        return resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx'));
    },
    setup({ el, App, props }) {
        // Debe ser el mismo árbol que renderiza ssr.tsx para que la hidratación coincida
        const app = (
            <>
                <NavigationLoader />
                <App {...props} />
                <Toaster />
            </>
        );

        // Con SSR el HTML ya viene pintado: se hidrata en lugar de volver a renderizar
        if (el.hasChildNodes()) {
            hydrateRoot(el, app);
        } else {
            createRoot(el).render(app);
        }
    },
    // Se usa NavigationLoader en lugar de la barra por defecto de Inertia.
    progress: false,
});

// This will set light / dark mode on load...
initializeTheme();

registerHttpErrorToasts();
