<?php

use App\Models\Text;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('shares published CMS texts with public Inertia pages', function () {
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
