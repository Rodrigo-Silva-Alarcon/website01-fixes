<?php

use App\Models\StoreSetting;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function storeTextsAdmin(): User
{
    seedRbac();
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

it('starts with the texts the store showed before they were editable', function () {
    // Los valores por defecto son exactamente los textos que estaban en el código
    $this->get('/')->assertOk()->assertInertia(fn ($page) => $page
        ->where('storeTexts.pickup_label', 'Retira en tienda')
        ->where('storeTexts.order_button', 'Solicitar pedido por WhatsApp')
        ->where('storeTexts.cart_perk_delivery', 'Delivery seguro')
        ->where('storeTexts.pdp_payment_text', 'Transferencia, QR o efectivo contra entrega')
        ->where('storeTexts.wa_order_intro', 'Hola, quiero hacer el siguiente pedido:')
        ->etc());

    expect(StoreSetting::first()->values())->toBe(StoreSetting::defaults());
});

it('opens the panel for admins and returns 403 without permission', function () {
    $this->actingAs(storeTextsAdmin())->get(route('admin.store-texts.index'))->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/store-texts/Index')->has('groups', 3)->etc());

    $viewer = User::factory()->create();
    $viewer->assignRole('viewer_textos');
    $this->actingAs($viewer)->get(route('admin.store-texts.index'))->assertForbidden();
    $this->actingAs($viewer)->put(route('admin.store-texts.update'), StoreSetting::defaults())->assertForbidden();
});

it('shows a saved text on the store right away, even with the cache warm', function () {
    $admin = storeTextsAdmin();

    // Primera visita: llena la caché
    $this->get('/')->assertInertia(fn ($page) => $page->where('storeTexts.pickup_label', 'Retira en tienda')->etc());

    $this->actingAs($admin)
        ->put(route('admin.store-texts.update'), [...StoreSetting::defaults(), 'pickup_label' => 'Retira en sucursal'])
        ->assertRedirect()
        ->assertSessionHas('success', 'Textos de la tienda actualizados.');

    auth()->logout();
    $this->get('/')->assertInertia(fn ($page) => $page->where('storeTexts.pickup_label', 'Retira en sucursal')->etc());
    expect(StoreSetting::first()->updated_by)->toBe($admin->id);
});

it('validates required fields and their length', function () {
    $this->actingAs(storeTextsAdmin())
        ->put(route('admin.store-texts.update'), [...StoreSetting::defaults(), 'pickup_label' => '', 'order_button' => str_repeat('x', 61)])
        ->assertSessionHasErrors(['pickup_label', 'order_button']);

    expect(StoreSetting::first()->values()['pickup_label'])->toBe('Retira en tienda');
});

it('reports when nothing changed', function () {
    $this->actingAs(storeTextsAdmin())
        ->put(route('admin.store-texts.update'), StoreSetting::defaults())
        ->assertSessionHas('success', 'No hubo cambios que guardar.');
});
