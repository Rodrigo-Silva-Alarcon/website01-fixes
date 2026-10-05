import { router } from '@inertiajs/react';
import { toast } from 'sonner';

const MESSAGES: Record<number, [string, string]> = {
    403: ['Acceso denegado', 'Tu rol no tiene permiso para realizar esta acción.'],
    404: ['No encontrado', 'El elemento que buscas ya no existe o fue movido.'],
    413: ['Archivos demasiado pesados', 'El envío supera el tamaño máximo que admite el servidor. Sube menos fotos a la vez o comprímelas.'],
    419: ['Tu sesión expiró', 'Por seguridad, recarga la página para continuar. Los cambios no guardados se perderán.'],
    429: ['Demasiadas solicitudes', 'Espera unos segundos antes de intentarlo de nuevo.'],
    503: ['Sistema en mantenimiento', 'Estamos realizando mejoras. Intenta nuevamente en unos minutos.'],
};

const FALLBACK: [string, string] = ['Ocurrió un problema', 'No pudimos completar la operación. Intenta nuevamente y, si persiste, contacta al administrador.'];

/**
 * Cambia el modal por defecto de Inertia (que muestra la página de error cruda
 * de Laravel) por un aviso con el estilo del panel.
 */
export function registerHttpErrorToasts() {
    router.on('invalid', (event) => {
        const { status } = event.detail.response;
        if (status < 400) return;
        event.preventDefault();
        if (import.meta.env.DEV) console.error('Respuesta inválida de Inertia', event.detail.response);

        const [title, description] = MESSAGES[status] ?? FALLBACK;
        toast.error(title, {
            id: `http-${status}`,
            description,
            duration: status === 419 ? Infinity : 8000,
            action: status === 419 ? { label: 'Recargar', onClick: () => window.location.reload() } : undefined,
        });
    });

    router.on('exception', (event) => {
        event.preventDefault();
        if (import.meta.env.DEV) console.error(event.detail.exception);
        const offline = typeof navigator !== 'undefined' && !navigator.onLine;
        toast.error(offline ? 'Sin conexión a internet' : FALLBACK[0], {
            id: 'http-exception',
            description: offline ? 'Revisa tu conexión y vuelve a intentarlo. Tus cambios siguen en pantalla.' : FALLBACK[1],
        });
    });
}
