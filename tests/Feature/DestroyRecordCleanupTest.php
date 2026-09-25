<?php

use App\Models\Banner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;

uses(RefreshDatabase::class);

function makeFileCleanupService(bool $thumbnails = true, string $dir = 'data/banners/'): object
{
    return new class($thumbnails, $dir) {
        use App\Traits\PostTrait;

        public function __construct(bool $thumbnails, string $dir)
        {
            $this->configureImages(['image', 'tecnical_image'], $dir, 1600, null, $thumbnails, 300, null);
        }
    };
}

it('destroyRecord removes image, thumbnail and webp variants stored as bare filename', function () {
    $dir = public_path('data/banners');
    $thumbDir = $dir . '/thumbs';
    File::makeDirectory($dir, 0755, true, true);
    File::makeDirectory($thumbDir, 0755, true, true);

    $base = 'pest-cleanup-abc';
    $targets = [
        "{$dir}/{$base}.png",
        "{$dir}/{$base}.webp",
        "{$thumbDir}/{$base}.png",
        "{$thumbDir}/{$base}.webp",
    ];
    foreach ($targets as $t) {
        File::put($t, 'x');
    }

    $banner = Banner::create([
        'name' => 'cleanup filename-only',
        'image' => "{$base}.png",
        'pages' => ['home'],
        'active' => true,
        'order' => 0,
    ]);

    makeFileCleanupService()->destroyRecord($banner);

    foreach ($targets as $t) {
        expect(File::exists($t))->toBeFalse();
    }
    expect(Banner::find($banner->id))->toBeNull();
});

it('destroyRecord removes file when the stored path is already complete (products convention)', function () {
    $dir = public_path('data/products-cleanup');
    File::makeDirectory($dir, 0755, true, true);

    $target = "{$dir}/pest-cleanup-full.png";
    File::put($target, 'x');

    $banner = Banner::create([
        'name' => 'cleanup full-path',
        'image' => 'data/products-cleanup/pest-cleanup-full.png',
        'pages' => ['home'],
        'active' => true,
        'order' => 0,
    ]);

    makeFileCleanupService(false, 'data/products-cleanup/')->destroyRecord($banner);

    expect(File::exists($target))->toBeFalse();
    expect(Banner::find($banner->id))->toBeNull();
});
