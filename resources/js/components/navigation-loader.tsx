import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// Retraso antes de mostrar el loader, para que las cargas rapidas no parpadeen.
const SHOW_DELAY_MS = 150;

/**
 * Indicador sutil de carga para cualquier visita de Inertia
 * (cambio de pagina, filtros, paginacion, busqueda...).
 * Muestra una barra fina animada arriba y atenua levemente el contenido.
 */
export default function NavigationLoader() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        let active = 0;

        const removeStart = router.on('start', () => {
            active++;
            clearTimeout(timer);
            timer = setTimeout(() => setLoading(true), SHOW_DELAY_MS);
        });

        const removeFinish = router.on('finish', () => {
            active = Math.max(0, active - 1);
            if (active === 0) {
                clearTimeout(timer);
                setLoading(false);
            }
        });

        return () => {
            clearTimeout(timer);
            removeStart();
            removeFinish();
        };
    }, []);

    useEffect(() => {
        document.documentElement.toggleAttribute('data-nav-loading', loading);
    }, [loading]);

    return (
        <div className={`nav-loader${loading ? ' is-loading' : ''}`} role="progressbar" aria-hidden={!loading} aria-busy={loading} aria-label="Cargando">
            <span className="nav-loader__bar" />
        </div>
    );
}
