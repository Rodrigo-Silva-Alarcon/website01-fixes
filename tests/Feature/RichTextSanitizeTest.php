<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Text;
use App\Models\User;
use Illuminate\Support\Facades\DB;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

const EVIL_HTML = '<p style="text-align:center">Hola <strong>mundo</strong></p><script>alert(1)</script>'
    .'<img src="/a.jpg" onerror="alert(2)"><a href="javascript:alert(3)">x</a>';

it('strips scripts from product descriptions saved in the panel and shown on the product page', function () {
    seedRbac();
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $category = Category::create(['name' => 'Audio', 'active' => true]);

    $this->actingAs($admin)
        ->post(route('products.store'), [
            'name' => 'Parlante',
            'category_id' => $category->id,
            'active' => '1',
            'description' => EVIL_HTML,
            'technical_info' => EVIL_HTML,
        ])
        ->assertRedirect();

    $product = Product::where('name', 'Parlante')->first();
    foreach (['description', 'technical_info'] as $field) {
        expect($product->$field)
            ->toContain('<p style="text-align:center">Hola <strong>mundo</strong></p>')
            ->not->toContain('<script')
            ->not->toContain('onerror')
            ->not->toContain('javascript:');
    }

    $this->get(route('product', [$category->slug, 'All', $product->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('product.description', $product->description));
});

it('strips scripts from CMS texts', function () {
    $text = Text::create([
        'name' => 'topbar_test', 'date' => now()->toDateString(), 'gender' => 'male',
        'type' => ['article'], 'print_view' => 'a4', 'content' => EVIL_HTML, 'publish' => true,
    ]);

    expect($text->fresh()->content)->not->toContain('<script')->not->toContain('onerror');
});

it('sanitizes rich text that was already stored', function () {
    $category = Category::create(['name' => 'Audio', 'active' => true]);
    $id = DB::table('products')->insertGetId([
        'name' => 'Viejo', 'slug' => 'Viejo', 'category_id' => $category->id,
        'description' => EVIL_HTML, 'technical_info' => null, 'active' => true,
    ]);

    (require database_path('migrations/2026_10_08_100000_sanitize_rich_text_content.php'))->up();

    expect(DB::table('products')->where('id', $id)->value('description'))
        ->toContain('<strong>mundo</strong>')
        ->not->toContain('<script')
        ->not->toContain('onerror');
});
