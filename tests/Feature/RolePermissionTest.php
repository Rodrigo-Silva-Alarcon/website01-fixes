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
        'name' => 'admin',
        'description' => 'Administrador',
    ]);
    $permission = Permission::create([
        'name' => 'create_user',
        'description' => 'Crear usuarios',
    ]);

    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    expect($user->hasPermission('create_user'))->toBeTrue();
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
        'name' => 'admin',
        'description' => 'Administrador',
    ]);
    $permission = Permission::create([
        'name' => 'create_user',
        'description' => 'Crear usuarios',
    ]);

    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    $this->actingAs($user);

    $response = $this->get('/admin/users/create');
    $response->assertStatus(200);
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
