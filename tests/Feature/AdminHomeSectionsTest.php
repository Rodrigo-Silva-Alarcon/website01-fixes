<?php

use App\Models\Category;
use App\Models\HomeSection;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function homeAdmin(): User
{
    seedRbac();
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

test('admin sees the home sections in order', function () {
    $this->actingAs(homeAdmin())
        ->get(route('admin.home.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/home/Index')
            ->where('sections.0.type', 'hero')
            ->where('sections.2.type', 'categories')
            ->where('sections.2.locked', true));
});

test('users without view_home get 403', function () {
    seedRbac();
    $user = User::factory()->create();
    $user->roles()->attach(Role::where('name', 'viewer_textos')->value('id'));

    $this->actingAs($user)->get(route('admin.home.index'))->assertForbidden();
});

test('sections can be reordered and the homepage follows the new order', function () {
    $admin = homeAdmin();
    $ids = HomeSection::orderBy('position')->pluck('id')->all();
    $reversed = array_reverse($ids);

    $this->actingAs($admin)->put(route('admin.home.reorder'), ['sections' => $reversed])->assertRedirect();

    expect(HomeSection::orderBy('position')->pluck('id')->all())->toBe($reversed);
});

test('the categories section cannot be deleted nor hidden', function () {
    $admin = homeAdmin();
    $categories = HomeSection::where('type', 'categories')->firstOrFail();

    $this->actingAs($admin)->delete(route('admin.home.destroy', $categories))->assertSessionHas('error');
    $this->actingAs($admin)->patch(route('admin.home.toggle', $categories))->assertSessionHas('error');

    expect($categories->fresh())->not->toBeNull()->and($categories->fresh()->active)->toBeTrue();
});

test('a manual products section shows the chosen products in that order', function () {
    $admin = homeAdmin();
    $category = Category::create(['name' => 'TV', 'active' => true]);
    $a = Product::create(['name' => 'Tele A', 'category_id' => $category->id, 'active' => true]);
    $b = Product::create(['name' => 'Tele B', 'category_id' => $category->id, 'active' => true]);

    $this->actingAs($admin)->post(route('admin.home.store'), [
        'type' => 'products',
        'title' => 'Elegidos',
        'settings' => ['source' => 'manual', 'product_ids' => [$b->id, $a->id]],
    ])->assertSessionHas('success');

    $section = HomeSection::where('title', 'Elegidos')->firstOrFail();
    expect($section->settings)->toBe(['source' => 'manual', 'product_ids' => [$b->id, $a->id]]);

    $this->get('/')->assertInertia(fn (Assert $page) => $page->where('sections', function ($sections) use ($a, $b) {
        $found = collect($sections)->firstWhere('title', 'Elegidos');

        return $found && collect($found['products'])->pluck('id')->all() === [$b->id, $a->id];
    }));
});

test('promo cards require exactly two products and can be edited', function () {
    $admin = homeAdmin();
    $category = Category::create(['name' => 'Audio', 'active' => true]);
    $a = Product::create(['name' => 'Parlante', 'category_id' => $category->id, 'active' => true]);
    $b = Product::create(['name' => 'Audífonos', 'category_id' => $category->id, 'active' => true]);
    $promo = HomeSection::where('type', 'promo')->firstOrFail();

    $this->actingAs($admin)->put(route('admin.home.update', $promo), ['settings' => ['product_ids' => [$a->id]]])
        ->assertSessionHasErrors('settings.product_ids');

    $this->actingAs($admin)->put(route('admin.home.update', $promo), ['settings' => ['product_ids' => [$b->id, $a->id]]])
        ->assertSessionHas('success');

    expect($promo->fresh()->productIds())->toBe([$b->id, $a->id]);
});

test('single sections cannot be added twice and hidden sections are not sent to the web', function () {
    $admin = homeAdmin();

    $this->actingAs($admin)->post(route('admin.home.store'), ['type' => 'brands'])->assertSessionHas('error');
    expect(HomeSection::where('type', 'brands')->count())->toBe(1);

    $showroom = HomeSection::where('type', 'showroom')->firstOrFail();
    $this->actingAs($admin)->patch(route('admin.home.toggle', $showroom))->assertSessionHas('success');

    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->where('sections', fn ($sections) => ! collect($sections)->contains('type', 'showroom')));
});

test('product search returns published products only', function () {
    $admin = homeAdmin();
    $category = Category::create(['name' => 'Cocina', 'active' => true]);
    Product::create(['name' => 'Horno visible', 'category_id' => $category->id, 'active' => true]);
    Product::create(['name' => 'Horno borrador', 'category_id' => $category->id, 'active' => false]);

    $this->actingAs($admin)->getJson(route('admin.home.products', ['q' => 'Horno']))
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonPath('0.name', 'Horno visible');
});

test('category images of the carousel can be added, replaced and removed from the home editor', function () {
    $admin = homeAdmin();
    $category = Category::create(['name' => 'Audio', 'active' => true]);
    $dir = public_path(config('variables.folder_category'));

    $this->actingAs($admin)
        ->post(route('admin.home.category-image', $category), ['image' => \Illuminate\Http\UploadedFile::fake()->image('a.png', 600, 600)])
        ->assertSessionHas('success');
    $first = $category->fresh()->image;
    expect($first)->not->toBeNull()->and(is_file($dir.$first))->toBeTrue();

    $this->actingAs($admin)
        ->post(route('admin.home.category-image', $category), ['image' => \Illuminate\Http\UploadedFile::fake()->image('b.png', 600, 600)])
        ->assertSessionHas('success');
    $second = $category->fresh()->image;
    expect($second)->not->toBe($first)->and(is_file($dir.$first))->toBeFalse();

    $this->actingAs($admin)->delete(route('admin.home.category-image.destroy', $category))->assertSessionHas('success');
    expect($category->fresh()->image)->toBeNull()->and(is_file($dir.$second))->toBeFalse();
});

test('category image upload rejects non images', function () {
    $admin = homeAdmin();
    $category = Category::create(['name' => 'Audio', 'active' => true]);

    $this->actingAs($admin)
        ->post(route('admin.home.category-image', $category), ['image' => \Illuminate\Http\UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf')])
        ->assertSessionHasErrors('image');
});
