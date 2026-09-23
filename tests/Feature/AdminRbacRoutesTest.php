<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
});

test('authenticated users with access_dashboard can visit the dashboard', function () {
    seedRbac();
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertOk();
});

test('authenticated users without access_dashboard get 403 (§5.1.1)', function () {
    seedRbac();
    $user = User::factory()->create();
    $role = \App\Models\Role::firstOrCreate(
        ['name' => 'viewer_textos'],
        ['description' => 'Viewer']
    );
    $user->roles()->attach($role->id);

    // viewer_textos tiene access_dashboard → usar rol sin ese permiso
    $role->permissions()->where('name', 'access_dashboard')->detach();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('users with no role cannot access the dashboard (§5.1.1)', function () {
    seedRbac();
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('viewer_textos cannot access users index (§5.1.1)', function () {
    seedRbac();
    $user = User::factory()->create();
    $user->assignRole('viewer_textos');

    $this->actingAs($user)
        ->get(route('admin.users.index'))
        ->assertForbidden();
});

test('viewer_textos can access texts index with view_texts', function () {
    seedRbac();
    $user = User::factory()->create();
    $user->assignRole('viewer_textos');

    $this->actingAs($user)
        ->get(route('admin.texts.index'))
        ->assertOk();
});

test('viewer_textos cannot access product images without view_products (§5.1.1)', function () {
    seedRbac();
    $user = User::factory()->create();
    $user->assignRole('viewer_textos');

    $category = \App\Models\Category::create(['name' => 'Cat', 'active' => true]);
    $product = \App\Models\Product::create([
        'name' => 'P',
        'category_id' => $category->id,
        'active' => true,
    ]);

    $this->actingAs($user)
        ->get(route('images.index', $product))
        ->assertForbidden();
});
