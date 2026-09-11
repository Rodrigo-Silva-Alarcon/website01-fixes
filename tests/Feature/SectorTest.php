<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('valida que los sectores configurados son correctos', function () {
    $sectors = config('variables.permission_sectors');
    
    expect($sectors)->toBeArray();
    expect($sectors)->toHaveKey('users');
    expect($sectors)->toHaveKey('roles');
    expect($sectors)->toHaveKey('permissions');
    expect($sectors)->toHaveKey('texts');
    
    expect($sectors['users'])->toBe('Usuarios');
    expect($sectors['roles'])->toBe('Roles');
    expect($sectors['permissions'])->toBe('Permisos');
    expect($sectors['texts'])->toBe('Textos');
});

it('puede crear permissions con diferentes sectores', function () {
    // Crear permissions por sector
    $permissions = [
        ['name' => 'view-users', 'sector' => 'users'],
        ['name' => 'create-roles', 'sector' => 'roles'],
        ['name' => 'edit-permissions', 'sector' => 'permissions'],
        ['name' => 'delete-texts', 'sector' => 'texts'],
    ];

    foreach ($permissions as $permission) {
        Permission::create($permission);
    }

    // Verificar que se crearon correctamente
    expect(Permission::count())->toBe(4);
    
    $usersPermission = Permission::where('sector', 'users')->first();
    expect($usersPermission->name)->toBe('view-users');
    expect($usersPermission->sector)->toBe('users');
    
    $rolesPermission = Permission::where('sector', 'roles')->first();
    expect($rolesPermission->name)->toBe('create-roles');
    expect($rolesPermission->sector)->toBe('roles');
});

it('valida que el modelo permission tiene los accesores correctos', function () {
    $permission = Permission::create([
        'name' => 'test-permission',
        'sector' => 'users'
    ]);
    
    expect($permission->sector_label)->not->toBeNull();
    expect($permission->sector_label)->toBe('Usuarios');
});

it('valida que el modelo permission puede filtrar por sector', function () {
    // Crear permissions de diferentes sectores
    Permission::create(['name' => 'view-users', 'sector' => 'users']);
    Permission::create(['name' => 'create-users', 'sector' => 'users']);
    Permission::create(['name' => 'view-roles', 'sector' => 'roles']);
    Permission::create(['name' => 'create-roles', 'sector' => 'roles']);

    $usersPermissions = Permission::bySector('users')->get();
    $rolesPermissions = Permission::bySector('roles')->get();
    
    expect($usersPermissions)->toHaveCount(2);
    expect($rolesPermissions)->toHaveCount(2);
    
    foreach ($usersPermissions as $permission) {
        expect($permission->sector)->toBe('users');
    }
    
    foreach ($rolesPermissions as $permission) {
        expect($permission->sector)->toBe('roles');
    }
});

it('puede crear un rol con permissions de diferentes sectores', function () {
    // Crear permissions
    $usersPermission = Permission::create(['name' => 'view-users', 'sector' => 'users']);
    $textoPermission = Permission::create(['name' => 'create-texts', 'sector' => 'texts']);

    // Crear rol
    $role = Role::create([
        'name' => 'Editor',
        'description' => 'Puede editar content'
    ]);

    // Asignar permissions
    $role->permissions()->attach([$usersPermission->id, $textoPermission->id]);

    expect($role->permissions)->toHaveCount(2);
    expect($role->permissions->pluck('sector')->toArray())->toContain('users', 'texts');
});

it('puede crear un texto con todos los campos', function () {
    $text = \App\Models\Text::create([
        'name' => 'Test Text',
        'date' => '2024-01-01',
        'gender' => 'male',
        'type' => ['report', 'article'],
        'print_view' => 'a4',
        'summary' => 'Resumen de prueba',
        'content' => 'Contenido de prueba',
        'publish' => false
    ]);

    expect($text->name)->toBe('Test Text');
    expect($text->gender)->toBe('male');
    expect($text->type)->toBe(['report', 'article']);
    expect($text->publish)->toBeFalse();
});

it('puede actualizar un texto', function () {
    $text = \App\Models\Text::create([
        'name' => 'Original Text',
        'date' => '2024-01-01',
        'gender' => 'male',
        'type' => ['report'],
        'print_view' => 'a4',
        'summary' => 'Resumen original',
        'content' => 'Contenido original',
        'publish' => false
    ]);

    $text->update([
        'name' => 'Updated Text',
        'gender' => 'female',
        'publish' => true
    ]);

    expect($text->fresh()->name)->toBe('Updated Text');
    expect($text->fresh()->gender)->toBe('female');
    expect($text->fresh()->publish)->toBeTrue();
});

it('puede eliminar un texto', function () {
    $text = \App\Models\Text::create([
        'name' => 'Text to Delete',
        'date' => '2024-01-01',
        'gender' => 'male',
        'type' => ['report'],
        'print_view' => 'a4',
        'summary' => 'Resumen',
        'content' => 'Contenido',
        'publish' => false
    ]);

    $textId = $text->id;
    $text->delete();

    expect(\App\Models\Text::find($textId))->toBeNull();
});

it('puede cambiar el estado de publicacion de un texto', function () {
    $text = \App\Models\Text::create([
        'name' => 'Toggle Text',
        'date' => '2024-01-01',
        'gender' => 'male',
        'type' => ['report'],
        'print_view' => 'a4',
        'summary' => 'Resumen',
        'content' => 'Contenido',
        'publish' => false
    ]);

    $text->update(['publish' => true]);

    expect($text->fresh()->publish)->toBeTrue();
});

it('valida que el modelo Text tiene los accesores correctos', function () {
    $text = \App\Models\Text::create([
        'name' => 'Test Text',
        'date' => '2024-01-01',
        'gender' => 'male',
        'type' => ['report'],
        'print_view' => 'a4',
        'summary' => 'Resumen',
        'content' => 'Contenido',
        'publish' => false
    ]);

    expect($text->gender_label)->toBe('Male');
    expect($text->print_view_label)->toBe('A4');
    expect($text->type_labels)->toBe('Report');
});

it('valida que el modelo Text puede manejar múltiples types', function () {
    $text = \App\Models\Text::create([
        'name' => 'Test Text',
        'date' => '2024-01-01',
        'gender' => 'female',
        'type' => ['report', 'article', 'news'],
        'print_view' => 'letter',
        'summary' => 'Resumen',
        'content' => 'Contenido',
        'publish' => false
    ]);

    expect($text->type_labels)->toBe('Report, Article, News');
    expect($text->gender_label)->toBe('Female');
    expect($text->print_view_label)->toBe('Letter');
});