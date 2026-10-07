import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../../resources/js/lib/product-enquiry.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { productPrice, productEnquiryUrl } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('missing, zero and invalid prices do not allow adding to cart', () => {
    assert.equal(productPrice(null), null);
    for (const amount of [null, '', '0.00', -1, 'invalid']) {
        assert.equal(productPrice({ amount, money: 'BOB' }), null);
    }
    assert.equal(productPrice({ amount: '125.50', money: 'BOB' }), 125.5);
});

test('uses the active offer when deciding if a product has a price', () => {
    const inventory = { amount: '100', offer_amount: '80', ini: '2026-09-01', fin: '2026-09-30', money: 'BOB' };
    assert.equal(productPrice(inventory, new Date('2026-09-09T12:00:00-04:00')), 80);
    assert.equal(productPrice(inventory, new Date('2026-10-01T12:00:00-04:00')), 100);
    assert.equal(productPrice({ ...inventory, offer_amount: null }, new Date('2026-09-09T12:00:00-04:00')), 100);
});

test('the offer lasts the whole start and end days in store time (America/La_Paz)', () => {
    const inventory = { amount: '3299.00', offer_amount: '3000.00', ini: '2026-10-05', fin: '2026-10-07', money: 'Bs.' };
    assert.equal(productPrice(inventory, new Date('2026-10-05T00:30:00-04:00')), 3000);
    assert.equal(productPrice(inventory, new Date('2026-10-07T14:51:00-04:00')), 3000);
    assert.equal(productPrice(inventory, new Date('2026-10-07T23:59:00-04:00')), 3000);
    assert.equal(productPrice(inventory, new Date('2026-10-08T00:01:00-04:00')), 3299);
    assert.equal(productPrice(inventory, new Date('2026-10-04T23:59:00-04:00')), 3299);
});

test('encodes product information and its link for the requested WhatsApp number', () => {
    const product = { name: 'Cámara & sensor #1', brand_label: 'Marca', inventory: { amount: '125.50', money: 'BOB' } };
    const url = new URL(productEnquiryUrl(product, 'https://example.com/Productos/camaras/All/camara'));
    assert.equal(url.origin + url.pathname, 'https://wa.me/59168210861');
    const message = url.searchParams.get('text');
    assert.ok(message.includes('Producto: Cámara & sensor #1'));
    assert.ok(message.includes('Marca: Marca'));
    assert.ok(message.includes('Precio: BOB 125.50'));
    assert.ok(message.includes('Enlace: https://example.com/Productos/camaras/All/camara'));
    const withoutPrice = new URL(productEnquiryUrl({ name: 'Sin precio' }, 'https://example.com/producto')).searchParams.get('text');
    assert.ok(withoutPrice.includes('consultar el precio y la disponibilidad'));
    assert.ok(!withoutPrice.includes('undefined'));
});
