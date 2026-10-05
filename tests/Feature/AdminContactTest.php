<?php

use App\Models\ContactLog;
use App\Models\ContactSetting;
use App\Models\Role;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function contactAdmin(): User
{
    seedRbac();
    $user = User::factory()->create(['name' => 'Ana Admin']);
    $user->assignRole('admin');

    return $user;
}

function contactData(array $overrides = []): array
{
    $fields = array_keys(ContactSetting::DATA_FIELDS);

    return array_merge(ContactSetting::firstOrFail()->only($fields), $overrides);
}

function contactSchedule(array $overrides = []): array
{
    $schedule = ContactSetting::DEFAULT_SCHEDULE;
    foreach ($overrides as $day => $values) {
        $schedule[$day - 1] = array_merge($schedule[$day - 1], $values);
    }

    return $schedule;
}

test('admin can open the Contacto panel', function () {
    $this->actingAs(contactAdmin())
        ->get(route('admin.contact.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/contact/Index')
            ->has('contact.schedule', 7)
            ->where('contact.hero_title', 'Contáctanos'));
});

test('users without view_contact get 403', function () {
    seedRbac();
    $user = User::factory()->create();
    $user->roles()->attach(Role::where('name', 'viewer_textos')->value('id'));

    $this->actingAs($user)->get(route('admin.contact.index'))->assertForbidden();
});

test('updating the phone replaces it on every public page and logs only what changed', function () {
    $this->actingAs(contactAdmin())
        ->put(route('admin.contact.data'), contactData(['whatsapp' => '+591 7000-1234', 'email' => 'ventas@smarthouse.test']))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(ContactLog::pluck('field')->sort()->values()->all())->toBe(['email', 'whatsapp']);
    expect(ContactSetting::first()->whatsapp)->toBe('59170001234');

    $this->get('/')->assertInertia(fn ($page) => $page
        ->where('contact.whatsapp', '59170001234')
        ->where('contact.email', 'ventas@smarthouse.test')
        ->missing('contact.form_recipient'));
});

test('saving unchanged data does not create log entries', function () {
    $this->actingAs(contactAdmin())->put(route('admin.contact.data'), contactData())->assertRedirect();

    expect(ContactLog::count())->toBe(0);
});

test('schedule accepts continuous, split and closed days with a different saturday', function () {
    $schedule = contactSchedule([
        1 => ['mode' => 'split', 'open' => '09:00', 'close' => '12:30', 'open2' => '14:30', 'close2' => '19:00'],
        6 => ['mode' => 'continuous', 'open' => '09:00', 'close' => '13:00'],
    ]);

    $this->actingAs(contactAdmin())
        ->put(route('admin.contact.schedule'), ['schedule' => $schedule, 'schedule_summary' => ''])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $saved = collect(ContactSetting::first()->schedule)->keyBy('day');
    expect($saved[1])->toMatchArray(['mode' => 'split', 'open2' => '14:30', 'close2' => '19:00'])
        ->and($saved[6])->toMatchArray(['mode' => 'continuous', 'close' => '13:00', 'open2' => null])
        ->and($saved[7])->toMatchArray(['mode' => 'closed', 'open' => null]);

    $log = ContactLog::where('field', 'day_1')->first();
    expect($log->old_value['v'])->toBe('09:00 – 18:00')
        ->and($log->new_value['v'])->toBe('09:00 – 12:30 y 14:30 – 19:00');
});

test('split schedule must resume after the break', function () {
    $schedule = contactSchedule([
        2 => ['mode' => 'split', 'open' => '09:00', 'close' => '13:00', 'open2' => '12:00', 'close2' => '18:00'],
    ]);

    $this->actingAs(contactAdmin())
        ->put(route('admin.contact.schedule'), ['schedule' => $schedule])
        ->assertSessionHasErrors('schedule.1.open2');
});

test('closing time must be after opening time', function () {
    $this->actingAs(contactAdmin())
        ->put(route('admin.contact.schedule'), ['schedule' => contactSchedule([3 => ['open' => '18:00', 'close' => '09:00']])])
        ->assertSessionHasErrors('schedule.2.close');
});

test('contact page texts are editable and shared with the public site', function () {
    $texts = ContactSetting::firstOrFail()->only(array_keys(ContactSetting::TEXT_FIELDS));

    $this->actingAs(contactAdmin())
        ->put(route('admin.contact.texts'), [...$texts, 'hero_title' => 'Hablemos', 'hours_note' => 'Feriados: cerrado'])
        ->assertRedirect();

    $this->get('/contactanos')->assertInertia(fn ($page) => $page
        ->where('contact.hero_title', 'Hablemos')
        ->where('contact.hours_note', 'Feriados: cerrado'));
});
