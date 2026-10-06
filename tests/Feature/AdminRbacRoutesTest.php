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

/** Usuario con un rol que solo tiene los permisos indicados. */
function userWithPermissions(array $permissions): User
{
    $role = \App\Models\Role::create(['name' => 'solo_'.uniqid(), 'description' => 'Prueba']);
    $role->permissions()->attach(\App\Models\Permission::whereIn('name', $permissions)->pluck('id'));
    $user = User::factory()->create();
    $user->roles()->attach($role->id);

    return $user;
}

test('view-only permissions cannot create, edit, publish or delete from the panel', function () {
    seedRbac();
    $category = \App\Models\Category::create(['name' => 'Audio', 'active' => true]);
    $text = \App\Models\Text::create(['name' => 'topbar_x', 'date' => now()->toDateString(), 'gender' => 'male', 'type' => ['article'], 'print_view' => 'a4', 'content' => 'x', 'publish' => true]);
    $brand = \App\Models\Brand::create(['name' => 'Sony', 'active' => true]);

    $user = userWithPermissions(['view_texts', 'view_categories', 'view_brands', 'view_users']);
    $this->actingAs($user);

    // Ver sigue permitido
    $this->get(route('admin.texts.index'))->assertOk();
    $this->get(route('categories.index'))->assertOk();

    // Cambiar no
    $this->post(route('admin.texts.store'), ['name' => 'nuevo'])->assertForbidden();
    $this->put(route('admin.texts.update', $text), ['name' => 'topbar_x'])->assertForbidden();
    $this->patch(route('admin.texts.toggle-publish', $text))->assertForbidden();
    $this->delete(route('admin.texts.destroy', $text))->assertForbidden();
    $this->patch(route('categories.toggle-publish', $category))->assertForbidden();
    $this->put(route('categories.reorder'), ['categories' => [$category->id]])->assertForbidden();
    $this->delete(route('categories.destroy', $category))->assertForbidden();
    $this->patch(route('brands.toggle-publish', $brand))->assertForbidden();
    $this->post(route('admin.users.store'), [])->assertForbidden();
    $this->delete(route('admin.users.destroy', $user))->assertForbidden();

    expect($text->fresh()->publish)->toBeTrue()
        ->and($category->fresh()->active)->toBeTrue()
        ->and($brand->fresh()->active)->toBeTrue();
});

test('each action works with its own permission', function () {
    seedRbac();
    $category = \App\Models\Category::create(['name' => 'Audio', 'active' => true]);
    $text = \App\Models\Text::create(['name' => 'topbar_x', 'date' => now()->toDateString(), 'gender' => 'male', 'type' => ['article'], 'print_view' => 'a4', 'content' => 'x', 'publish' => true]);

    $this->actingAs(userWithPermissions(['view_texts', 'publish_texts', 'view_categories', 'edit_categories']));

    $this->patch(route('admin.texts.toggle-publish', $text))->assertRedirect();
    $this->patch(route('categories.toggle-publish', $category))->assertRedirect();

    expect($text->fresh()->publish)->toBeFalse()
        ->and($category->fresh()->active)->toBeFalse();
});

test('editor_textos keeps full access to texts', function () {
    seedRbac();
    $user = User::factory()->create();
    $user->assignRole('editor_textos');

    $this->actingAs($user)->get(route('admin.texts.create'))->assertOk();
});
