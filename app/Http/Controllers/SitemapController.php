<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Subcategory;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $baseUrl = rtrim(config('app.url'), '/');

        $urls = [
            ['loc' => $baseUrl . '/', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['loc' => route('products'), 'priority' => '0.9', 'changefreq' => 'daily'],
            ['loc' => route('about'), 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['loc' => route('contact'), 'priority' => '0.6', 'changefreq' => 'monthly'],
        ];

        $categories = Category::publicados()->get();
        foreach ($categories as $category) {
            $urls[] = [
                'loc' => route('category', ['category' => $category->slug]),
                'priority' => '0.8',
                'changefreq' => 'weekly',
                'lastmod' => $category->updated_at?->toIso8601String(),
            ];

            foreach ($category->subcategories()->where('active', true)->get() as $subcategory) {
                $urls[] = [
                    'loc' => route('subcategory', [
                        'category' => $category->slug,
                        'subcategory' => $subcategory->slug,
                    ]),
                    'priority' => '0.7',
                    'changefreq' => 'weekly',
                    'lastmod' => $subcategory->updated_at?->toIso8601String(),
                ];
            }
        }

        $brands = \App\Models\Brand::publicados()->get();
        foreach ($brands as $brand) {
            $urls[] = [
                'loc' => route('brand', ['brand' => $brand->id]),
                'priority' => '0.7',
                'changefreq' => 'weekly',
            ];
        }

        Product::publicados()
            ->with(['category:id,slug,active', 'subcategory:id,slug'])
            ->orderByDesc('updated_at')
            ->chunk(200, function ($products) use (&$urls) {
                foreach ($products as $product) {
                    if (! $product->category || ! $product->category->active) {
                        continue;
                    }
                    $urls[] = [
                        'loc' => route('product', [
                            'category' => $product->category->slug,
                            'subcategory' => $product->subcategory?->slug ?? 'All',
                            'product' => $product->slug,
                        ]),
                        'priority' => '0.6',
                        'changefreq' => 'weekly',
                        'lastmod' => $product->updated_at?->toIso8601String(),
                    ];
                }
            });

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($urls as $url) {
            $xml .= "  <url>\n";
            $xml .= '    <loc>' . e($url['loc']) . "</loc>\n";
            if (! empty($url['lastmod'])) {
                $xml .= '    <lastmod>' . e($url['lastmod']) . "</lastmod>\n";
            }
            if (! empty($url['changefreq'])) {
                $xml .= '    <changefreq>' . $url['changefreq'] . "</changefreq>\n";
            }
            if (! empty($url['priority'])) {
                $xml .= '    <priority>' . $url['priority'] . "</priority>\n";
            }
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }
}
