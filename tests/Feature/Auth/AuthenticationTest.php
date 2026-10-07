<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('admin.dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect(route('home'));
});

test('users are rate limited', function () {
    $user = User::factory()->create();

    for ($i = 0; $i < 4; $i++) {
        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertStatus(302)->assertSessionHasErrors('password');
    }

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors('email');

    $this->assertStringContainsString('Demasiados intentos fallidos', session('errors')->first('email'));
    $this->assertGuest();
});

test('login shows a message when the email does not exist', function () {
    $this->post(route('login.store'), [
        'email' => 'no-existe@example.com',
        'password' => 'password',
    ])->assertSessionHasErrors([
        'email' => 'No existe ninguna cuenta registrada con este correo electrónico.',
    ]);

    $this->assertGuest();
});

test('login shows a message when the password is wrong', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors([
        'password' => 'La contraseña es incorrecta.',
    ]);
});

test('login warns about the remaining attempts', function () {
    $user = User::factory()->create();

    for ($i = 0; $i < 3; $i++) {
        $this->post(route('login.store'), ['email' => $user->email, 'password' => 'wrong-password']);
    }

    $this->assertStringContainsString('Te quedan 2 intentos', session('errors')->first('password'));
});

test('login validates empty fields and email format', function () {
    $this->post(route('login.store'), ['email' => '', 'password' => ''])
        ->assertSessionHasErrors([
            'email' => 'Ingresa tu correo electrónico.',
            'password' => 'Ingresa tu contraseña.',
        ]);

    $this->post(route('login.store'), ['email' => 'no-es-un-correo', 'password' => 'password'])
        ->assertSessionHasErrors('email');
});

test('login ignores surrounding spaces and uppercase in the email', function () {
    $user = User::factory()->create(['email' => 'admin@gmail.com']);

    $this->post(route('login.store'), [
        'email' => '  Admin@Gmail.com ',
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($user);
});

test('signed-in users opening the login screen go to the admin panel, not the store', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('login'))->assertRedirect(route('admin.dashboard'));
});
