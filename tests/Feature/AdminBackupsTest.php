<?php

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->dir = storage_path('framework/testing/backups-'.uniqid());
    config(['backups.path' => $this->dir]);
});

afterEach(function () {
    File::deleteDirectory($this->dir);
});

it('lists and downloads backups for admins', function () {
    seedRbac();
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $name = 'db-'.CarbonImmutable::now()->format('Y-m-d_His').'.sqlite.gz';
    File::ensureDirectoryExists($this->dir);
    file_put_contents($this->dir.'/'.$name, 'x');

    $this->actingAs($admin)
        ->get(route('admin.backups.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/backups/Index')
            ->where('database.0.name', $name)
        );

    $this->actingAs($admin)
        ->get(route('admin.backups.download', $name))
        ->assertOk()
        ->assertDownload($name);

    $this->actingAs($admin)
        ->get('/admin/backups/..%2F..%2F.env/download')
        ->assertNotFound();
});

it('is not available to non-admin users', function () {
    seedRbac();
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.backups.index'))->assertForbidden();
});

it('can be granted to other roles with view and create permissions', function () {
    seedRbac();
    $role = \App\Models\Role::create(['name' => 'respaldos']);
    $role->permissions()->attach(\App\Models\Permission::where('name', 'view_backups')->value('id'));
    $user = User::factory()->create();
    $user->assignRole('respaldos');

    $this->actingAs($user)->get(route('admin.backups.index'))->assertOk();
    $this->actingAs($user)->post(route('admin.backups.store'))->assertForbidden();
});

it('gives the admin role every permission, including new ones', function () {
    seedRbac();
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    \App\Models\Permission::create(['name' => 'view_something_new', 'sector' => 'general']);

    expect($admin->hasPermission('view_backups'))->toBeTrue()
        ->and($admin->hasPermission('edit_orders'))->toBeTrue()
        ->and($admin->hasPermission('view_something_new'))->toBeTrue();
});

it('does not let a non-admin edit the admin role', function () {
    seedRbac();
    $role = \App\Models\Role::create(['name' => 'gestor_roles']);
    $role->permissions()->attach(\App\Models\Permission::whereIn('name', ['view_roles', 'edit_roles'])->pluck('id'));
    $user = User::factory()->create();
    $user->assignRole('gestor_roles');
    $adminRole = \App\Models\Role::where('name', 'admin')->first();

    $this->actingAs($user)->get(route('admin.roles.edit', $adminRole))->assertForbidden();
    $this->actingAs($user)->get(route('admin.roles.edit', $role))->assertOk();
});
