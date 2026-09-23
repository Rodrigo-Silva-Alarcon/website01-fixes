<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ConvertImagesWebp extends Command
{
    protected $signature = 'images:webp {--force : Regenerar WebP existentes}';
    protected $description = 'Generar variantes WebP para imágenes bajo public/data (products, categories, banners, texts)';

    public function handle(): int
    {
        $roots = [
            public_path('data/products'),
            public_path('data/categories'),
            public_path('data/banners'),
            public_path('data/texts'),
        ];

        $manager = new ImageManager(new Driver());
        $converted = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($roots as $root) {
            if (!is_dir($root)) {
                continue;
            }

            $files = File::allFiles($root);
            foreach ($files as $file) {
                $ext = strtolower($file->getExtension());
                if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif'], true)) {
                    continue;
                }

                $target = preg_replace('/\.[^.]+$/', '.webp', $file->getPathname());
                if (is_file($target) && !$this->option('force')) {
                    $skipped++;
                    continue;
                }

                try {
                    $manager->read($file->getPathname())->toWebp(82)->save($target);
                    $converted++;
                } catch (\Throwable $e) {
                    $failed++;
                    $this->warn("Falló {$file->getPathname()}: {$e->getMessage()}");
                }
            }
        }

        $this->info("WebP generados: {$converted}; omitidos: {$skipped}; fallidos: {$failed}");

        return self::SUCCESS;
    }
}
