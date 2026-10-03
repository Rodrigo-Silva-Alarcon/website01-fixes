<?php

use App\Models\Text;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('shares published CMS texts with public Inertia pages', function () {
    // Partir sin los textos por defecto que crean las migraciones
    Text::query()->delete();

    Text::create([
        'name' => 'footer_email',
        'date' => now()->toDateString(),
        'gender' => 'male',
        'type' => ['article'],
        'print_view' => 'a4',
        'content' => 'hola@smarthouse.test',
        'publish' => true,
    ]);

    Text::create([
        'name' => 'hidden_key',
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
            ->where('cmsTexts.footer_email', 'hola@smarthouse.test')
            ->missing('cmsTexts.hidden_key'));
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

it('shares footer contact CMS keys for conditional footer buttons', function () {
    $keys = [
        'footer_whatsapp' => '59170000000',
        'footer_email' => 'contacto@smarthouse.test',
        'footer_maps' => 'https://maps.app.goo.gl/xyz',
        'footer_facebook' => 'https://facebook.com/smarthouse',
        'footer_instagram' => 'https://instagram.com/smarthouse',
        'footer_twitter' => 'https://x.com/smarthouse',
        'footer_address' => 'Av. Siempre Viva 742, La Paz',
    ];

    foreach ($keys as $name => $content) {
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
            ->where('cmsTexts.footer_whatsapp', '59170000000')
            ->where('cmsTexts.footer_email', 'contacto@smarthouse.test')
            ->where('cmsTexts.footer_maps', 'https://maps.app.goo.gl/xyz')
            ->where('cmsTexts.footer_facebook', 'https://facebook.com/smarthouse')
            ->where('cmsTexts.footer_instagram', 'https://instagram.com/smarthouse')
            ->where('cmsTexts.footer_twitter', 'https://x.com/smarthouse')
            ->where('cmsTexts.footer_address', 'Av. Siempre Viva 742, La Paz'));
});
