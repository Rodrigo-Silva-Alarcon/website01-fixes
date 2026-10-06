import { DEFAULT_WHATSAPP, STORE_TEXT_DEFAULTS, whatsappLink } from '@/lib/cms';

type CartLine = {
    name: string;
    unit_price: number | string;
    amount: number;
    money: string;
    product?: { brand_label?: string | null } | null;
};

export function currencyLabel(money: string): string {
    return ['BOB', 'BO', 'BS', 'BS.'].includes(money.trim().toUpperCase()) ? 'Bs.' : money;
}

export function itemSubtotal(item: CartLine): number {
    return Math.round(Number(item.unit_price) * 100) * item.amount;
}

export function cartTotals(items: CartLine[]): Record<string, number> {
    return items.reduce<Record<string, number>>((totals, item) => {
        const money = currencyLabel(item.money);
        totals[money] = (totals[money] ?? 0) + itemSubtotal(item);
        return totals;
    }, {});
}

export function whatsappCartUrl(items: CartLine[], phone: string = DEFAULT_WHATSAPP, intro: string = STORE_TEXT_DEFAULTS.wa_order_intro): string {
    const lines = items.map((item, i) => {
        const money = currencyLabel(item.money);
        const brand = item.product?.brand_label;
        return [
            `${i + 1}. *${item.name}*`,
            brand ? `   Marca: ${brand}` : '',
            `   Cantidad: ${item.amount}`,
            `   Precio unitario: ${money} ${Number(item.unit_price).toFixed(2)}`,
            `   Subtotal: ${money} ${(itemSubtotal(item) / 100).toFixed(2)}`,
        ].filter(Boolean).join('\n');
    });
    const units = items.reduce((sum, item) => sum + item.amount, 0);
    const totals = Object.entries(cartTotals(items)).map(([money, cents]) => `*TOTAL: ${money} ${(cents / 100).toFixed(2)}*`);
    const message = [
        intro,
        '',
        lines.join('\n\n'),
        '',
        `Productos: ${items.length} · Unidades: ${units}`,
        ...totals,
    ].join('\n');
    return whatsappLink(phone, message);
}
