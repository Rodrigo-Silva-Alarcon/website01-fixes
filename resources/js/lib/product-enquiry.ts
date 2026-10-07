import { DEFAULT_WHATSAPP, STORE_TEXT_DEFAULTS, whatsappLink } from '@/lib/cms';

type InventoryPrice = {
    amount: number | string | null;
    offer_amount?: number | string | null;
    ini?: string | null;
    fin?: string | null;
    money: string;
};

// Día calendario de la tienda (igual que now()->toDateString() en Laravel). Las fechas de
// oferta son días sin hora: `new Date('2026-10-07')` es medianoche UTC y dejaba fuera el
// último día de la oferta, por eso se comparan como texto YYYY-MM-DD.
const storeDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit' });

export function isOnOffer(inventory?: InventoryPrice | null, now = new Date()): boolean {
    if (!inventory) return false;
    const today = storeDay.format(now);
    const start = inventory.ini ? String(inventory.ini).slice(0, 10) : null;
    const end = inventory.fin ? String(inventory.fin).slice(0, 10) : null;
    const window = Boolean((start || end) && (!start || start <= today) && (!end || today <= end));
    const offer = inventory.offer_amount != null && inventory.offer_amount !== '' ? Number(inventory.offer_amount) : NaN;
    return window && Number.isFinite(offer) && offer > 0;
}

export function productPrice(inventory?: InventoryPrice | null, now = new Date()): number | null {
    if (!inventory) return null;
    const price = isOnOffer(inventory, now) ? Number(inventory.offer_amount) : Number(inventory.amount);
    return Number.isFinite(price) && price > 0 ? price : null;
}

export function productEnquiryUrl(product: {
    name: string;
    brand_label?: string | null;
    inventory?: InventoryPrice | null;
}, productUrl: string, phone: string = DEFAULT_WHATSAPP, texts: { intro: string; noPrice: string } = {
    intro: STORE_TEXT_DEFAULTS.wa_product_intro,
    noPrice: STORE_TEXT_DEFAULTS.wa_product_no_price,
}): string {
    const price = productPrice(product.inventory);
    const message = [
        texts.intro,
        `Producto: ${product.name}`,
        product.brand_label ? `Marca: ${product.brand_label}` : '',
        price !== null ? `Precio: ${product.inventory?.money} ${price.toFixed(2)}` : texts.noPrice,
        `Enlace: ${productUrl}`,
    ].filter(Boolean).join('\n');
    return whatsappLink(phone, message);
}
