<?php

use App\Models\Banner;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeBanner(array $overrides = []): Banner
{
    return Banner::create(array_merge([
        'name' => 'Banner test',
        'pages' => ['home'],
        'active' => true,
        'order' => 0,
    ], $overrides));
}

it('includes banners without schedule or within date window', function () {
    makeBanner(['name' => 'always', 'start_date' => null, 'end_date' => null]);
    makeBanner([
        'name' => 'active-window',
        'start_date' => now()->subDay()->toDateString(),
        'end_date' => now()->addDay()->toDateString(),
    ]);

    $ids = Banner::scheduled()->pluck('id');

    expect($ids)->toHaveCount(2);
});

it('excludes banners outside schedule window', function () {
    makeBanner(['name' => 'future', 'start_date' => now()->addDays(2)->toDateString()]);
    makeBanner(['name' => 'expired', 'end_date' => now()->subDay()->toDateString()]);
    makeBanner(['name' => 'inactive', 'active' => false]);

    $ids = Banner::scheduled()->pluck('id');

    expect($ids)->toHaveCount(0);
});

it('shows panel banners on the homepage and reflects toggles immediately', function () {
    $shown = makeBanner(['name' => 'portada', 'image' => 'a.jpg', 'pages' => ['1'], 'type' => 3, 'url' => 'https://example.com/promo']);
    makeBanner(['name' => 'otra-pagina', 'image' => 'b.jpg', 'pages' => ['2']]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('banners', 1)
            ->where('banners.0.name', 'portada')
            ->where('banners.0.link', 'https://example.com/promo')
            ->where('banners.0.external', true));

    // Desactivar en el panel no debe esperar a que venza la caché
    $shown->update(['active' => false]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('banners', 0));
});

it('requires at least one page when saving a banner from the panel', function () {
    seedRbac();
    $admin = \App\Models\User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('banners.store'), ['name' => 'sin página', 'active' => '1'])
        ->assertSessionHasErrors('pages');

    expect(Banner::where('name', 'sin página')->exists())->toBeFalse();
});

it('saves unchecking pages on edit instead of keeping the old ones', function () {
    seedRbac();
    $admin = \App\Models\User::factory()->create();
    $admin->assignRole('admin');
    $banner = makeBanner(['image' => 'a.jpg', 'pages' => ['1', '2']]);

    $this->actingAs($admin)
        ->put(route('banners.update', $banner), ['name' => 'Banner test', 'pages' => ['2'], 'active' => '1'])
        ->assertRedirect(route('banners.index'));

    expect($banner->fresh()->pages)->toBe(['2']);

    $this->get('/')->assertInertia(fn ($page) => $page->has('banners', 0));
});
