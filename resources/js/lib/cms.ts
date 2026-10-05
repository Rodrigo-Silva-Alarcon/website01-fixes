import { usePage } from '@inertiajs/react';
import { autoSummary, DEFAULT_SCHEDULE, type ScheduleDay } from '@/lib/schedule';

/**
 * Textos editables desde el panel (Admin › Textos). El backend comparte los publicados
 * como `cmsTexts` (nombre => contenido); aquí se leen con un valor por defecto para que
 * la web nunca quede vacía si un texto no existe o está despublicado.
 */

/** WhatsApp por defecto (con código de país, solo dígitos). */
export const DEFAULT_WHATSAPP = '59168210861';

const ENTITIES: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&ntilde;': 'ñ',
    '&Aacute;': 'Á',
    '&Eacute;': 'É',
    '&Iacute;': 'Í',
    '&Oacute;': 'Ó',
    '&Uacute;': 'Ú',
    '&Ntilde;': 'Ñ',
};

/**
 * El panel usa un editor enriquecido: convierte su HTML a texto plano
 * (cada párrafo o salto de línea pasa a ser un "\n").
 */
export function plainText(html?: string | null): string {
    if (!html) return '';
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&[a-zA-Z]+;|&#\d+;/g, (e) => ENTITIES[e] ?? (e.startsWith('&#') ? String.fromCharCode(Number(e.slice(2, -1))) : e))
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join('\n');
}

/** "59168210861" → "682-10861" (formato local boliviano); otros números se muestran tal cual. */
export function formatWhatsappLocal(digits: string): string {
    const local = digits.startsWith('591') ? digits.slice(3) : digits;
    return local.length === 8 ? `${local.slice(0, 3)}-${local.slice(3)}` : local;
}

/** "59168210861" → "+591 6821 0861" */
export function formatWhatsappIntl(digits: string): string {
    if (digits.startsWith('591') && digits.length >= 11) {
        const local = digits.slice(3, 11);
        return `+591 ${local.slice(0, 4)} ${local.slice(4)}`;
    }
    return `+${digits}`;
}

export function whatsappLink(digits: string, message?: string): string {
    return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

/** Datos de Admin › Contacto que comparte el backend como `contact` en las páginas públicas. */
export interface ContactInfo {
    whatsapp: string;
    phone: string | null;
    email: string;
    address: string;
    city: string | null;
    maps_url: string | null;
    website: string | null;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    tiktok: string | null;
    schedule: ScheduleDay[];
    schedule_summary: string | null;
    hero_title: string;
    hero_subtitle: string | null;
    form_title: string;
    form_subtitle: string | null;
    form_success: string;
    hours_title: string;
    hours_note: string | null;
}

const DEFAULT_ADDRESS = ['Av. 20 de Octubre', 'Esq. Rosendo Gutierrez', 'Edif. Guadalquivir #2332'];

export function useCms() {
    const { cmsTexts, contact } = usePage<{ cmsTexts?: Record<string, string>; contact?: ContactInfo | null }>().props;
    const texts = cmsTexts ?? {};

    /** Texto plano del panel o el valor por defecto. */
    const text = (key: string, fallback = ''): string => plainText(texts[key]) || fallback;
    /** Igual que text() pero separado por líneas (un párrafo del editor = una línea). */
    const lines = (key: string, fallback: string[] = []): string[] => {
        const value = plainText(texts[key]);
        return value ? value.split('\n') : fallback;
    };

    // Admin › Contacto es la fuente única; los textos antiguos solo sirven de respaldo
    const whatsapp = (contact?.whatsapp || text('footer_whatsapp')).replace(/\D/g, '') || DEFAULT_WHATSAPP;
    const addressLines = contact?.address ? contact.address.split('\n').filter(Boolean) : lines('showroom_address', DEFAULT_ADDRESS);
    const address = addressLines.join(', ');
    const schedule = contact?.schedule?.length ? contact.schedule : DEFAULT_SCHEDULE;

    const info = {
        email: contact?.email || text('footer_email', 'contacto@smarthouse.com.bo'),
        phone: contact?.phone || '',
        addressLines,
        address,
        city: contact?.city ?? text('footer_address'),
        mapsHref:
            contact?.maps_url ||
            text('footer_maps') ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address} La Paz Bolivia`)}`,
        website: contact?.website ?? text('site_url', 'www.smarthousebo.com'),
        facebook: contact ? contact.facebook || '' : text('footer_facebook'),
        instagram: contact ? contact.instagram || '' : text('footer_instagram'),
        twitter: contact ? contact.twitter || '' : text('footer_twitter'),
        tiktok: contact?.tiktok || '',
        schedule,
        scheduleSummary: contact?.schedule_summary || autoSummary(schedule),
    };

    return {
        texts,
        text,
        lines,
        contact: contact ?? null,
        ...info,
        whatsapp,
        whatsappLocal: formatWhatsappLocal(whatsapp),
        whatsappIntl: formatWhatsappIntl(whatsapp),
        whatsappHref: (message?: string) => whatsappLink(whatsapp, message),
    };
}
