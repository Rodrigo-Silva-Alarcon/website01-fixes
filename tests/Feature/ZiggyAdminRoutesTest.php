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
        ->and($html)->toContain('Ziggy.routes');
});

it('still exposes admin ziggy routes on admin pages for authenticated users', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $html = $this->actingAs($admin)->get('/admin/dashboard')->assertOk()->getContent();

    expect($html)->toContain('admin.dashboard')
        ->and($html)->toContain('Ziggy.routes');
});
