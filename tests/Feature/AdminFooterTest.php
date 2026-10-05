<?php

use App\Models\FooterSetting;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    config(['variables.folder_footer' => 'data/footer-test/']);
});

afterEach(function () {
    File::deleteDirectory(public_path('data/footer-test'));
});

function footerAdmin(): User
{
    seedRbac();
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

function footerPayload(array $overrides = []): array
{
    return array_merge(
        FooterSetting::firstOrFail()->only(['logo_alt', 'copyright', 'credits']),
        ['logo_transparent' => false],
        $overrides,
    );
}

test('admin can open the Footer panel', function () {
    $this->actingAs(footerAdmin())
        ->get(route('admin.footer.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/footer/Index')
            ->where('footer.logo_alt', 'Smart House Importaciones SRL')
            ->where('defaultLogo', FooterSetting::DEFAULT_LOGO));
});

test('users without view_footer get 403', function () {
    seedRbac();
    $user = User::factory()->create();
    $user->roles()->attach(Role::where('name', 'viewer_textos')->value('id'));

    $this->actingAs($user)->get(route('admin.footer.index'))->assertForbidden();
});

test('without uploaded logos the storefront uses the default logo', function () {
    $this->get('/')->assertInertia(fn ($page) => $page
        ->where('footer.logo.light.src', FooterSetting::DEFAULT_LOGO)
        ->where('footer.logo.dark', null)
        ->where('footer.logo.themed', false));
});

test('light and dark logos are stored and both reach the storefront', function () {
    $this->actingAs(footerAdmin())
        ->post(route('admin.footer.update'), footerPayload([
            'logo_light' => UploadedFile::fake()->image('claro.png', 1200, 300),
            'logo_dark' => UploadedFile::fake()->image('oscuro.png', 1200, 300),
            'copyright' => '© Mi tienda {año}',
        ]))
        ->assertRedirect()
        ->assertSessionHas('success');

    $footer = FooterSetting::first();
    foreach (['logo_light', 'logo_light_fallback', 'logo_dark', 'logo_dark_fallback'] as $field) {
        expect(File::exists(public_path($footer->$field)))->toBeTrue();
    }
    expect($footer->logo_light)->toEndWith('.webp')->and($footer->logo_light_fallback)->toEndWith('.png');

    auth()->logout();
    $this->get('/')->assertInertia(fn ($page) => $page
        ->where('footer.logo.light.src', '/'.$footer->logo_light)
        ->where('footer.logo.dark.src', '/'.$footer->logo_dark)
        ->where('footer.logo.themed', true)
        ->where('footer.copyright', '© Mi tienda {año}'));
});

test('a transparent logo is used for both modes and the dark one is ignored', function () {
    $admin = footerAdmin();
    $this->actingAs($admin)->post(route('admin.footer.update'), footerPayload([
        'logo_light' => UploadedFile::fake()->image('claro.png', 600, 200),
        'logo_dark' => UploadedFile::fake()->image('oscuro.png', 600, 200),
    ]));

    $this->actingAs($admin)
        ->post(route('admin.footer.update'), footerPayload(['logo_transparent' => true]))
        ->assertRedirect();

    $footer = FooterSetting::first();
    // El logo oscuro se conserva por si se vuelve a desmarcar la casilla
    expect($footer->logo_transparent)->toBeTrue()->and($footer->logo_dark)->not->toBeNull();

    auth()->logout();
    $this->get('/')->assertInertia(fn ($page) => $page
        ->where('footer.logo.light.src', '/'.$footer->logo_light)
        ->where('footer.logo.dark', null)
        ->where('footer.logo.themed', true));
});

test('replacing or removing a logo deletes the previous files', function () {
    $admin = footerAdmin();
    $this->actingAs($admin)->post(route('admin.footer.update'), footerPayload([
        'logo_light' => UploadedFile::fake()->image('uno.png', 600, 200),
    ]));
    $first = FooterSetting::first()->only(['logo_light', 'logo_light_fallback']);

    $this->actingAs($admin)->post(route('admin.footer.update'), footerPayload([
        'logo_light' => UploadedFile::fake()->image('dos.png', 600, 200),
    ]));
    expect(File::exists(public_path($first['logo_light'])))->toBeFalse()
        ->and(File::exists(public_path($first['logo_light_fallback'])))->toBeFalse();

    $second = FooterSetting::first()->logo_light;
    $this->actingAs($admin)->post(route('admin.footer.update'), footerPayload(['remove_logo_light' => true]));
    expect(FooterSetting::first()->logo_light)->toBeNull()
        ->and(File::exists(public_path($second)))->toBeFalse();
});

test('saving without changes reports it and texts are validated', function () {
    $admin = footerAdmin();

    $this->actingAs($admin)
        ->post(route('admin.footer.update'), footerPayload())
        ->assertSessionHas('success', 'No hubo cambios que guardar.');

    $this->actingAs($admin)
        ->post(route('admin.footer.update'), footerPayload(['copyright' => '', 'logo_light' => UploadedFile::fake()->create('logo.pdf', 10, 'application/pdf')]))
        ->assertSessionHasErrors(['copyright', 'logo_light']);
});
