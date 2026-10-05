import { router } from '@inertiajs/react';
import { type PendingVisit } from '@inertiajs/core';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Protege los cambios sin guardar.
 * - Navegación dentro del panel (Inertia): se detiene la visita y se pide confirmación
 *   con un diálogo propio; al confirmar se repite la misma visita.
 * - Recargar / cerrar la pestaña: solo existe el aviso nativo del navegador
 *   (su texto y diseño no se pueden personalizar).
 */
export function useUnsavedChangesGuard(dirty: boolean) {
    const [pending, setPending] = useState<PendingVisit | null>(null);
    const allowNext = useRef(false);

    useEffect(() => {
        if (!dirty) return;
        const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
        window.addEventListener('beforeunload', onUnload);
        const off = router.on('before', (event) => {
            const visit = event.detail.visit;
            // Envíos, recargas parciales (paginar el historial) y prefetch al pasar el mouse no salen de la página
            if (visit.method !== 'get' || visit.only.length || visit.prefetch) return;
            if (allowNext.current) {
                allowNext.current = false;
                return;
            }
            event.preventDefault();
            setPending(visit);
        });
        return () => {
            window.removeEventListener('beforeunload', onUnload);
            off();
        };
    }, [dirty]);

    const confirm = useCallback(() => {
        if (!pending) return;
        allowNext.current = true;
        setPending(null);
        router.visit(pending.url.href, {
            method: pending.method,
            data: pending.data,
            replace: pending.replace,
            preserveScroll: pending.preserveScroll,
            preserveState: pending.preserveState,
            headers: pending.headers,
        });
    }, [pending]);

    const cancel = useCallback(() => setPending(null), []);

    return { open: pending !== null, confirm, cancel };
}
