<?php

use App\Models\Text;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('shares published CMS texts with public Inertia pages', function () {
    // Partir sin los textos por defecto que crean las migraciones
    Text::query()->delete();

    Text::create([
        'name' => 'topbar_1',
        'date' => now()->toDateString(),
        'gender' => 'male',
        'type' => ['article'],
        'print_view' => 'a4',
        'content' => 'Envío gratis',
        'publish' => true,
    ]);

    Text::create([
        'name' => 'topbar_2',
        'date' => now()->toDateString(),
        'gender' => 'male',
        'type' => ['article'],
        'print_view' => 'a4',
        'content' => 'no debe aparecer',
        'publish' => false,
    ]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('cmsTexts', 1)
            ->where('cmsTexts.topbar_1', 'Envío gratis')
            ->missing('cmsTexts.topbar_2'));
});

it('does not share CMS texts on admin routes', function () {
    $this->get('/login')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('cmsTexts', []));
});

it('redirects legacy mixed-case paths with 301', function () {
    $map = [
        '/Contacto' => '/contactanos',
        '/contacto' => '/contactanos',
        '/Nosotros' => '/nosotros',
        '/Productos' => '/productos',
        '/Marcas' => '/marcas',
        '/Servicios' => '/contactanos',
        '/Contactanos' => '/contactanos',
        '/Find' => '/find',
    ];

    foreach ($map as $from => $to) {
        $this->get($from)->assertStatus(301)->assertRedirect($to);
    }
});

it('only shares the texts the store reads, not every published text', function () {
    // Textos de demostración o claves antiguas (ahora en Admin › Contacto) no viajan en cada página
    foreach (['Artículo de demostración' => '<h1>Demo</h1>', 'footer_email' => 'viejo@smarthouse.test', 'topbar_2' => 'Promos'] as $name => $content) {
        Text::create([
            'name' => $name,
            'date' => now()->toDateString(),
            'gender' => 'male',
            'type' => ['article'],
            'print_view' => 'a4',
            'content' => $content,
            'publish' => true,
        ]);
    }

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('cmsTexts.topbar_2', 'Promos')
            ->missing('cmsTexts.footer_email')
            ->missing('cmsTexts.Artículo de demostración'));
});
