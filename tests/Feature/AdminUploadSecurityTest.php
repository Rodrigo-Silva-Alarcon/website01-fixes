<?php

use App\Models\Banner;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    config(['variables.folder_banner' => 'data/banners-test/']);
    seedRbac();
    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

afterEach(function () {
    File::deleteDirectory(public_path('data/banners-test'));
});

it('never stores an image under the extension sent by the browser', function () {
    // Una imagen PNG válida con nombre .php: la validación la rechaza…
    $png = UploadedFile::fake()->image('real.png', 400, 200);
    $evil = fn () => new UploadedFile($png->getPathname(), 'evil.php', 'image/png', null, true);

    $this->actingAs($this->admin)
        ->post(route('banners.store'), ['name' => 'subida', 'active' => '1', 'image' => $evil()])
        ->assertSessionHasErrors('image');

    // …y aunque llegara al guardado, el nombre sale del contenido real
    $handler = new class { use \App\Traits\ImageHandling; };
    expect($handler::imageExtension($evil()))->toBe('png')
        ->and(File::glob(public_path('data/banners-test/{,*/}*.php'), GLOB_BRACE))->toBe([]);
});

it('saves a valid image with its real extension', function () {
    $this->actingAs($this->admin)
        ->post(route('banners.store'), ['name' => 'valida', 'active' => '1', 'image' => UploadedFile::fake()->image('foto.PNG', 400, 200)])
        ->assertRedirect(route('banners.index'));

    expect(Banner::where('name', 'valida')->value('image'))->toEndWith('.png');
});

it('rejects files that are not images', function () {
    $this->actingAs($this->admin)
        ->post(route('banners.store'), ['name' => 'pdf', 'active' => '1', 'image' => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf')])
        ->assertSessionHasErrors('image');

    expect(Banner::where('name', 'pdf')->exists())->toBeFalse();
});

it('rejects images larger than 5 MB', function () {
    $this->actingAs($this->admin)
        ->post(route('banners.store'), ['name' => 'grande', 'active' => '1', 'image' => UploadedFile::fake()->image('grande.png')->size(6000)])
        ->assertSessionHasErrors('image');
});

it('validates image type and size on brands, products, categories and texts', function () {
    $pdf = fn () => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf');
    $category = \App\Models\Category::create(['name' => 'Cat', 'active' => true]);

    $this->actingAs($this->admin);
    $this->post(route('brands.store'), ['name' => 'Marca', 'image' => $pdf()])->assertSessionHasErrors('image');
    $this->post(route('categories.store'), ['name' => 'Otra', 'image' => $pdf()])->assertSessionHasErrors('image');
    $this->post(route('products.store'), ['name' => 'Prod', 'category_id' => $category->id, 'image' => $pdf(), 'tecnical_image' => $pdf()])
        ->assertSessionHasErrors(['image', 'tecnical_image']);
    $this->post(route('admin.texts.store'), ['name' => 'clave', 'image' => $pdf()])->assertSessionHasErrors('image');
});
