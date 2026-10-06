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

it('always saves panel banners on the homepage', function () {
    seedRbac();
    $admin = \App\Models\User::factory()->create();
    $admin->assignRole('admin');

    // Aunque llegue otra página (formulario antiguo), el banner queda en Inicio
    $this->actingAs($admin)
        ->post(route('banners.store'), ['name' => 'sin página', 'pages' => ['2'], 'active' => '1'])
        ->assertRedirect(route('banners.index'));

    expect(Banner::where('name', 'sin página')->first()->pages)->toBe(['1']);
});

it('only shows banners on the homepage', function () {
    makeBanner(['name' => 'portada', 'image' => 'a.jpg', 'pages' => ['1']]);

    $this->get(route('about'))->assertOk()->assertInertia(fn ($page) => $page->missing('banners'));
    $this->get(route('contact'))->assertOk()->assertInertia(fn ($page) => $page->missing('banners'));
    $this->get(route('products', ['offers' => 1]))->assertOk()->assertInertia(fn ($page) => $page->missing('banners'));
    $this->get('/')->assertOk()->assertInertia(fn ($page) => $page->has('banners', 1));
});

it('drops the old about, offers and contact pages from existing banners', function () {
    $home = makeBanner(['name' => 'inicio y nosotros', 'pages' => ['1', '2']]);
    $about = makeBanner(['name' => 'solo nosotros', 'pages' => ['2', '4']]);

    (require database_path('migrations/2026_10_08_000000_keep_banners_only_on_home.php'))->up();

    expect($home->fresh()->pages)->toBe(['1'])
        ->and($about->fresh()->pages)->toBe([]);
});

it('only accepts banner links to https pages or to this website', function () {
    seedRbac();
    $admin = \App\Models\User::factory()->create();
    $admin->assignRole('admin');
    $this->actingAs($admin);

    $this->post(route('banners.store'), ['name' => 'malo', 'type' => '3', 'url' => 'javascript:alert(1)', 'active' => '1'])
        ->assertSessionHasErrors('url');
    $this->post(route('banners.store'), ['name' => 'tipo', 'type' => '9', 'active' => '1'])
        ->assertSessionHasErrors('type');
    $this->post(route('banners.store'), ['name' => 'externo', 'type' => '3', 'url' => 'https://example.com/promo', 'active' => '1'])
        ->assertSessionHasNoErrors();
    $this->post(route('banners.store'), ['name' => 'interno', 'type' => '3', 'url' => '/productos?offers=1', 'active' => '1'])
        ->assertSessionHasNoErrors();
});
