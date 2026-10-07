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
