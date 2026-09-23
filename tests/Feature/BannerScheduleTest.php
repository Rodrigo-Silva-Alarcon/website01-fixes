<?php

use App\Models\Banner;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeBanner(array $overrides = []): Banner
{
    return Banner::create(array_merge([
        'name' => 'Banner test',
        'pages' => ['home'],
        'active' => true,
        'order' => 0,
    ], $overrides));
}

it('includes banners without schedule or within date window', function () {
    makeBanner(['name' => 'always', 'start_date' => null, 'end_date' => null]);
    makeBanner([
        'name' => 'active-window',
        'start_date' => now()->subDay()->toDateString(),
        'end_date' => now()->addDay()->toDateString(),
    ]);

    $ids = Banner::scheduled()->pluck('id');

    expect($ids)->toHaveCount(2);
});

it('excludes banners outside schedule window', function () {
    makeBanner(['name' => 'future', 'start_date' => now()->addDays(2)->toDateString()]);
    makeBanner(['name' => 'expired', 'end_date' => now()->subDay()->toDateString()]);
    makeBanner(['name' => 'inactive', 'active' => false]);

    $ids = Banner::scheduled()->pluck('id');

    expect($ids)->toHaveCount(0);
});
