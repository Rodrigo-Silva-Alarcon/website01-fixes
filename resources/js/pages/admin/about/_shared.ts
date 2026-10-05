import { type Page } from '@inertiajs/core';
import { toast } from 'sonner';

export interface Editor {
    id: number;
    name: string;
}

export interface AboutImage {
    id: number;
    position: number;
    image: string;
    image_url: string;
    alt: string;
    focus_x: number;
    focus_y: number;
    updated_at: string | null;
    editor: Editor | null;
}

export const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

/** Muestra el mensaje flash que devuelve el servidor tras cada guardado. */
export const flash = (page: Page) => {
    const messages = (page.props as { flash?: { success?: string; error?: string } }).flash;
    if (messages?.success) toast.success(messages.success);
    if (messages?.error) toast.error(messages.error);
};
