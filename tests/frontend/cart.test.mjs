import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../../resources/js/lib/cart.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { cartTotals, whatsappCartUrl } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const items = [
    { name: 'Cámara & sensor #1', amount: 3, unit_price: '12.35', money: 'BOB' },
    { name: 'Cable', amount: 2, unit_price: '0.10', money: 'Bs.' },
];

test('totals use cents and update when quantities change or items are removed', () => {
    assert.deepEqual(cartTotals(items), { 'Bs.': 3725 });
    assert.deepEqual(cartTotals([{ ...items[0], amount: 1 }, items[1]]), { 'Bs.': 1255 });
    assert.deepEqual(cartTotals([items[1]]), { 'Bs.': 20 });
    assert.deepEqual(cartTotals([]), {});
});

test('different currencies are not added together', () => {
    assert.deepEqual(cartTotals([...items, { name: 'USD item', amount: 1, unit_price: 10, money: 'USD' }]), { 'Bs.': 3725, USD: 1000 });
});

test('WhatsApp gets the requested number, products, quantities and matching total', () => {
    const url = new URL(whatsappCartUrl(items));
    assert.equal(url.origin + url.pathname, 'https://wa.me/59168210861');
    const message = url.searchParams.get('text');
    assert.ok(message.includes('Cámara & sensor #1\n  Cantidad: 3 × Bs. 12.35 = Bs. 37.05'));
    assert.ok(message.includes('Cable\n  Cantidad: 2 × Bs. 0.10 = Bs. 0.20'));
    assert.ok(message.endsWith('TOTAL: Bs. 37.25'));
    assert.equal(url.searchParams.size, 1);
});
