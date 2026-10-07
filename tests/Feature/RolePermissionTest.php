<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('puede crear roles', function () {
    $role = Role::create([
        'name' => 'test_role',
        'description' => 'Rol de prueba',
    ]);

    expect($role->name)->toBe('test_role');
    expect($role->description)->toBe('Rol de prueba');
});

test('puede crear permisos', function () {
    $permission = Permission::create([
        'name' => 'test_permission',
        'description' => 'Permiso de prueba',
    ]);

    expect($permission->name)->toBe('test_permission');
    expect($permission->description)->toBe('Permiso de prueba');
});

test('puede asignar permisos a roles', function () {
    $role = Role::create([
        'name' => 'test_role',
        'description' => 'Rol de prueba',
    ]);

    $permission = Permission::create([
        'name' => 'test_permission',
        'description' => 'Permiso de prueba',
    ]);

    $role->permissions()->attach($permission->id);

    expect($role->permissions()->count())->toBe(1);
    expect($role->permissions()->first()->name)->toBe('test_permission');
});

test('puede asignar roles a usuarios', function () {
    $user = User::factory()->create();
    $role = Role::create([
        'name' => 'test_role',
        'description' => 'Rol de prueba',
    ]);

    $user->roles()->attach($role->id);

    expect($user->roles()->count())->toBe(1);
    expect($user->roles()->first()->name)->toBe('test_role');
});

test('usuario puede verificar si tiene un rol', function () {
    $user = User::factory()->create();
    $role = Role::create([
        'name' => 'admin',
        'description' => 'Administrador',
    ]);

    $user->roles()->attach($role->id);

    expect($user->hasRole('admin'))->toBeTrue();
    expect($user->hasRole('editor'))->toBeFalse();
});

test('usuario puede verificar si tiene un permiso', function () {
    $user = User::factory()->create();
    $role = Role::create([
        'name' => 'editor',
        'description' => 'Editor',
    ]);
    $permission = Permission::create([
        'name' => 'view_users',
        'description' => 'Ver usuarios',
    ]);

    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    expect($user->hasPermission('view_users'))->toBeTrue();
    expect($user->hasPermission('delete_user'))->toBeFalse();
});

test('middleware de rol funciona correctamente', function () {
    $user = User::factory()->create();
    $role = Role::create([
        'name' => 'admin',
        'description' => 'Administrador',
    ]);
    $user->roles()->attach($role->id);

    $this->actingAs($user);

    $response = $this->get('/admin/roles');
    $response->assertStatus(200);
});

test('middleware de permiso funciona correctamente', function () {
    $user = User::factory()->create();
    $role = Role::create([
        'name' => 'editor',
        'description' => 'Editor',
    ]);
    $permission = Permission::create([
        'name' => 'view_users',
        'description' => 'Ver usuarios',
    ]);

    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    $this->actingAs($user);

    // Ver usuarios no basta para crear: hace falta create_users
    $this->get('/admin/users')->assertStatus(200);
    $this->get('/admin/users/create')->assertStatus(403);

    $role->permissions()->attach(Permission::create(['name' => 'create_users', 'description' => 'Crear usuarios'])->id);
    $this->get('/admin/users/create')->assertStatus(200);
});

test('usuario sin rol no puede acceder a rutas protegidas', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get('/admin/roles');
    $response->assertStatus(403);
});

test('usuario sin permiso no puede acceder a rutas protegidas', function () {
    $user = User::factory()->create();
    $role = Role::create([
        'name' => 'viewer',
        'description' => 'Visualizador',
    ]);
    $user->roles()->attach($role->id);

    $this->actingAs($user);

    // Probar acceso a una ruta que requiere permiso específico
    $response = $this->get('/admin/permissions');
    $response->assertStatus(403);
});

test('granular catalog permissions exist for admin sections (§4.8.8)', function () {
    seedRbac();

    foreach (['products', 'categories', 'subcategories', 'brands', 'banners', 'inventories'] as $sector) {
        foreach (['view', 'create', 'edit', 'delete', 'show'] as $action) {
            expect(Permission::where('name', "{$action}_{$sector}")->exists())
                ->toBeTrue("Missing permission {$action}_{$sector}");
        }
    }

    // Ventanas de una sola página: solo las acciones que usan
    foreach (['about', 'contact', 'footer', 'store_texts', 'orders'] as $sector) {
        expect(Permission::where('sector', $sector)->pluck('name')->sort()->values()->all())
            ->toBe(["edit_{$sector}", "view_{$sector}"]);
    }
    expect(Permission::where('sector', 'backups')->pluck('name')->sort()->values()->all())
        ->toBe(['create_backups', 'view_backups']);
});

test('every admin panel route permission exists and is assigned to admin', function () {
    seedRbac();

    $admin = Role::where('name', 'admin')->first();
    $used = collect(app('router')->getRoutes())
        ->flatMap(fn ($route) => $route->gatherMiddleware())
        ->filter(fn ($m) => is_string($m) && str_starts_with($m, 'permission:'))
        ->map(fn ($m) => substr($m, strlen('permission:')))
        ->unique();

    foreach ($used as $name) {
        expect($admin->hasPermission($name))->toBeTrue("Admin missing {$name}");
    }
});

test('admin role has all catalog permissions after seed', function () {
    seedRbac();

    $admin = Role::where('name', 'admin')->first();
    expect($admin)->not->toBeNull();
    expect($admin->hasPermission('view_products'))->toBeTrue();
    expect($admin->hasPermission('view_orders'))->toBeTrue();
    expect($admin->hasPermission('view_banners'))->toBeTrue();
});
