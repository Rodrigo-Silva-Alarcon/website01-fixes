type CartLine = { name: string; unit_price: number | string; amount: number; money: string };

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

export function whatsappCartUrl(items: CartLine[]): string {
    const lines = items.map(item =>
        `• ${item.name}\n  Cantidad: ${item.amount} × ${currencyLabel(item.money)} ${Number(item.unit_price).toFixed(2)} = ${currencyLabel(item.money)} ${(itemSubtotal(item) / 100).toFixed(2)}`
    );
    const totals = Object.entries(cartTotals(items)).map(([money, cents]) => `TOTAL: ${money} ${(cents / 100).toFixed(2)}`);
    const message = ['Hola, quiero comprar los siguientes productos:', '', ...lines, '', ...totals].join('\n');
    return `https://wa.me/59168210861?text=${encodeURIComponent(message)}`;
}
