type InventoryPrice = {
    amount: number | string | null;
    offer_amount?: number | string | null;
    ini?: string | null;
    fin?: string | null;
    money: string;
};

export function productPrice(inventory?: InventoryPrice | null, now = new Date()): number | null {
    if (!inventory) return null;
    const start = inventory.ini ? new Date(inventory.ini) : null;
    const end = inventory.fin ? new Date(inventory.fin) : null;
    const onOffer = Boolean((start || end) && (!start || start <= now) && (!end || now <= end));
    const offer = inventory.offer_amount != null && inventory.offer_amount !== '' ? Number(inventory.offer_amount) : NaN;
    const base = Number(inventory.amount);
    const price = onOffer && Number.isFinite(offer) && offer > 0 ? offer : base;
    return Number.isFinite(price) && price > 0 ? price : null;
}

export function isOnOffer(inventory?: InventoryPrice | null, now = new Date()): boolean {
    if (!inventory) return false;
    const start = inventory.ini ? new Date(inventory.ini) : null;
    const end = inventory.fin ? new Date(inventory.fin) : null;
    const window = Boolean((start || end) && (!start || start <= now) && (!end || now <= end));
    const offer = inventory.offer_amount != null && inventory.offer_amount !== '' ? Number(inventory.offer_amount) : NaN;
    return window && Number.isFinite(offer) && offer > 0;
}

export function productEnquiryUrl(product: {
    name: string;
    brand_label?: string | null;
    inventory?: InventoryPrice | null;
}, productUrl: string): string {
    const price = productPrice(product.inventory);
    const message = [
        'Hola, quisiera más información sobre este producto:',
        `Producto: ${product.name}`,
        product.brand_label ? `Marca: ${product.brand_label}` : '',
        price !== null ? `Precio: ${product.inventory?.money} ${price.toFixed(2)}` : 'Quisiera consultar el precio y la disponibilidad.',
        `Enlace: ${productUrl}`,
    ].filter(Boolean).join('\n');
    return `https://wa.me/59168210861?text=${encodeURIComponent(message)}`;
}
