import { usePage } from '@inertiajs/react';

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

export function useCms() {
    const { cmsTexts } = usePage<{ cmsTexts?: Record<string, string> }>().props;
    const texts = cmsTexts ?? {};

    /** Texto plano del panel o el valor por defecto. */
    const text = (key: string, fallback = ''): string => plainText(texts[key]) || fallback;
    /** Igual que text() pero separado por líneas (un párrafo del editor = una línea). */
    const lines = (key: string, fallback: string[] = []): string[] => {
        const value = plainText(texts[key]);
        return value ? value.split('\n') : fallback;
    };

    const whatsapp = text('footer_whatsapp').replace(/\D/g, '') || DEFAULT_WHATSAPP;

    return {
        texts,
        text,
        lines,
        whatsapp,
        whatsappLocal: formatWhatsappLocal(whatsapp),
        whatsappIntl: formatWhatsappIntl(whatsapp),
        whatsappHref: (message?: string) => whatsappLink(whatsapp, message),
    };
}
