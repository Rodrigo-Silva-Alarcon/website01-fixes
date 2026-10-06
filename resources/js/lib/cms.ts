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

/** WhatsApp por defecto tal como se guarda en Admin › Contacto. */
export const DEFAULT_WHATSAPP_INTL = '+591 68210861';

/**
 * Separa el número guardado ("+591 68210861") en código de país y número local.
 * Los valores antiguos solo con dígitos se interpretan como bolivianos si empiezan con 591.
 */
export function splitWhatsapp(value: string): { code: string; local: string } {
    const match = value.trim().match(/^\+?(\d{1,4})\s+(\d+)$/);
    if (match) return { code: match[1], local: match[2] };
    const digits = value.replace(/\D/g, '');
    return digits.startsWith('591') ? { code: '591', local: digits.slice(3) } : { code: '', local: digits };
}

/** "+591 68210861" → "+591 68210861" (código de país, espacio y número seguido). */
export function formatWhatsappIntl(value: string): string {
    const { code, local } = splitWhatsapp(value);
    return code ? `+${code} ${local}` : `+${local}`;
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
    show_map: boolean;
    hours_title: string;
    hours_note: string | null;
}

const DEFAULT_ADDRESS = ['Av. 20 de Octubre', 'Esq. Rosendo Gutierrez', 'Edif. Guadalquivir #2332'];

/** Admin › Textos de la tienda. Mismos valores por defecto que StoreSetting::FIELDS. */
export const STORE_TEXT_DEFAULTS = {
    order_button: 'Solicitar pedido por WhatsApp',
    cart_perk_delivery: 'Delivery seguro',
    cart_perk_payment: 'Pago seguro: transferencia, QR o efectivo',
    pickup_label: 'Retira en tienda',
    pdp_delivery_title: 'Delivery seguro',
    pdp_delivery_text: 'Entrega a domicilio',
    pdp_payment_title: 'Pago seguro',
    pdp_payment_text: 'Transferencia, QR o efectivo contra entrega',
    pdp_condition_default: 'Producto original con garantía oficial',
    pdp_warranty: 'Oficial del fabricante',
    pdp_condition: 'Nuevo, sellado',
    wa_order_intro: 'Hola, quiero hacer el siguiente pedido:',
    wa_product_intro: 'Hola, quisiera más información sobre este producto:',
    wa_product_no_price: 'Quisiera consultar el precio y la disponibilidad.',
    wa_restock: 'Hola, quisiera consultar sobre la disponibilidad y reingreso de productos',
};

export type StoreTextKey = keyof typeof STORE_TEXT_DEFAULTS;

export function useCms() {
    const { cmsTexts, contact, storeTexts } = usePage<{
        cmsTexts?: Record<string, string>;
        contact?: ContactInfo | null;
        storeTexts?: Partial<Record<StoreTextKey, string>>;
    }>().props;
    const texts = cmsTexts ?? {};

    /** Texto plano del panel o el valor por defecto. */
    const text = (key: string, fallback = ''): string => plainText(texts[key]) || fallback;
    /** Igual que text() pero separado por líneas (un párrafo del editor = una línea). */
    const lines = (key: string, fallback: string[] = []): string[] => {
        const value = plainText(texts[key]);
        return value ? value.split('\n') : fallback;
    };

    // Admin › Contacto es la fuente única; los textos antiguos solo sirven de respaldo
    const whatsappRaw = contact?.whatsapp || text('footer_whatsapp') || DEFAULT_WHATSAPP_INTL;
    // Solo dígitos para los enlaces wa.me
    const whatsapp = whatsappRaw.replace(/\D/g, '') || DEFAULT_WHATSAPP;
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
        // Mapa embebido (sin API key) con la dirección exacta del showroom
        mapEmbedSrc: `https://maps.google.com/maps?q=${encodeURIComponent(`${address}, ${(contact?.city ?? text('footer_address')) || 'La Paz, Bolivia'}`)}&z=17&output=embed`,
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
        whatsappIntl: formatWhatsappIntl(whatsappRaw),
        whatsappHref: (message?: string) => whatsappLink(whatsapp, message),
        /** Texto de Admin › Textos de la tienda o su valor por defecto. */
        store: (key: StoreTextKey): string => storeTexts?.[key] || STORE_TEXT_DEFAULTS[key],
    };
}
