<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('does not expose admin ziggy routes on public pages', function () {
    $html = $this->get('/')->assertOk()->getContent();

    expect($html)->not->toContain('admin.dashboard')
        ->and($html)->not->toContain('admin.users.index')
        ->and($html)->not->toContain('products.index')
        ->and($html)->not->toContain('admin\/products')
        ->and($html)->toContain('const Ziggy=');
});

it('still exposes admin ziggy routes on admin pages for authenticated users', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $html = $this->actingAs($admin)->get('/admin/dashboard')->assertOk()->getContent();

    expect($html)->toContain('admin.dashboard')
        ->and($html)->toContain('const Ziggy=');
});

it('exposes admin ziggy routes to authenticated users on public pages for SPA navigation', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    // Login via Inertia no recarga el HTML: el payload Ziggy del request
    // inicial (público) persiste. Autenticados deben tener rutas admin.
    $html = $this->actingAs($admin)->get('/')->assertOk()->getContent();

    expect($html)->toContain('products.index');
});
