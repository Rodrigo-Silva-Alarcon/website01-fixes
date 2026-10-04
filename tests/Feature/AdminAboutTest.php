<?php

use App\Models\AboutImage;
use App\Models\AboutLog;
use App\Models\AboutPage;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function aboutAdmin(): User
{
    seedRbac();
    $user = User::factory()->create(['name' => 'Ana Admin']);
    $user->assignRole('admin');

    return $user;
}

function aboutTexts(array $overrides = []): array
{
    return array_merge(AboutPage::firstOrFail()->only(array_keys(AboutPage::FIELDS)), $overrides);
}

test('admin can open the Nosotros panel', function () {
    $this->actingAs(aboutAdmin())
        ->get(route('admin.about.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/about/Index')
            ->where('page.title', 'Sobre Smart House')
            ->has('images', 4));
});

test('users without view_about get 403', function () {
    seedRbac();
    $user = User::factory()->create();
    $user->roles()->attach(Role::where('name', 'viewer_textos')->value('id'));

    $this->actingAs($user)->get(route('admin.about.index'))->assertForbidden();
});

test('updating texts logs only the fields that changed and updates the public page', function () {
    $admin = aboutAdmin();

    $this->actingAs($admin)
        ->put(route('admin.about.texts'), aboutTexts(['title' => 'Conoce Smart House', 'vision' => 'Nueva visión']))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(AboutLog::count())->toBe(2);
    $log = AboutLog::where('field', 'title')->first();
    expect($log->action)->toBe('text_updated')
        ->and($log->user_name)->toBe('Ana Admin')
        ->and($log->old_value['v'])->toBe('Sobre Smart House')
        ->and($log->new_value['v'])->toBe('Conoce Smart House');
    expect(AboutPage::first()->updated_by)->toBe($admin->id);

    $this->get('/nosotros')->assertInertia(fn ($page) => $page
        ->where('about.title', 'Conoce Smart House')
        ->where('about.vision', 'Nueva visión'));
});

test('saving unchanged texts does not create log entries', function () {
    $this->actingAs(aboutAdmin())->put(route('admin.about.texts'), aboutTexts())->assertRedirect();

    expect(AboutLog::count())->toBe(0);
});

test('focus and alt changes are logged separately', function () {
    $image = AboutImage::where('position', 1)->first();

    $this->actingAs(aboutAdmin())
        ->patch(route('admin.about.images.update', $image), ['focus_x' => 30, 'focus_y' => 70, 'alt' => 'Nueva descripción'])
        ->assertRedirect();

    expect(AboutLog::pluck('action')->sort()->values()->all())->toBe(['image_alt', 'image_focus']);
    expect($image->fresh()->only(['focus_x', 'focus_y']))->toBe(['focus_x' => 30, 'focus_y' => 70]);
});

test('reordering swaps positions and records before and after', function () {
    $ids = AboutImage::orderBy('position')->pluck('id')->all();
    $swapped = [$ids[3], $ids[1], $ids[2], $ids[0]];

    $this->actingAs(aboutAdmin())
        ->put(route('admin.about.images.reorder'), ['images' => $swapped])
        ->assertRedirect();

    expect(AboutImage::orderBy('position')->pluck('id')->all())->toBe($swapped);
    expect(AboutLog::where('action', 'image_moved')->count())->toBe(1);
});

test('replacing an image stores webp + jpg and keeps the old path in the log', function () {
    $image = AboutImage::where('position', 2)->first();
    $old = $image->image;

    $this->actingAs(aboutAdmin())
        ->post(route('admin.about.images.replace', $image), ['image' => UploadedFile::fake()->image('nueva.png', 1600, 2000)])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $image->refresh();
    expect($image->image)->toEndWith('.webp')->and($image->fallback)->toEndWith('.jpg');
    expect(File::exists(public_path($image->image)))->toBeTrue();
    expect(getimagesize(public_path($image->image))[0])->toBe(1200);

    $log = AboutLog::where('action', 'image_replaced')->first();
    expect($log->old_value['v'])->toBe($old)->and($log->new_value['v'])->toBe($image->image);

    File::delete([public_path($image->image), public_path($image->fallback)]);
});

test('general gallery save applies order, focus and new photo in one request', function () {
    $images = AboutImage::orderBy('position')->get();
    $payload = [
        ['id' => $images[1]->id, 'focus_x' => 50, 'focus_y' => 50],
        ['id' => $images[0]->id, 'focus_x' => 20, 'focus_y' => 80],
        ['id' => $images[2]->id, 'focus_x' => $images[2]->focus_x, 'focus_y' => $images[2]->focus_y, 'image' => UploadedFile::fake()->image('nueva.png', 1600, 2000)],
        ['id' => $images[3]->id, 'focus_x' => $images[3]->focus_x, 'focus_y' => $images[3]->focus_y],
    ];

    $this->actingAs(aboutAdmin())
        ->post(route('admin.about.gallery'), ['images' => $payload])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(AboutImage::orderBy('position')->pluck('id')->all())->toBe([$images[1]->id, $images[0]->id, $images[2]->id, $images[3]->id]);
    expect($images[0]->fresh()->only(['focus_x', 'focus_y']))->toBe(['focus_x' => 20, 'focus_y' => 80]);
    expect(AboutLog::pluck('action')->unique()->sort()->values()->all())->toBe(['image_focus', 'image_moved', 'image_replaced']);

    $new = $images[2]->fresh();
    File::delete([public_path($new->image), public_path($new->fallback)]);
});

test('users with view_about but without edit_about cannot change anything', function () {
    seedRbac();
    $role = Role::firstOrCreate(['name' => 'viewer_about'], ['description' => 'Viewer']);
    $role->permissions()->sync(\App\Models\Permission::whereIn('name', ['view_about'])->pluck('id'));
    $user = User::factory()->create();
    $user->roles()->attach($role->id);

    $this->actingAs($user)->get(route('admin.about.index'))->assertOk();
    $this->actingAs($user)->put(route('admin.about.texts'), aboutTexts(['title' => 'X']))->assertForbidden();
});
