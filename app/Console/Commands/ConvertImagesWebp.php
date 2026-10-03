<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ConvertImagesWebp extends Command
{
    protected $signature = 'images:webp
        {--force : Regenerar WebP existentes}
        {--thumb-width=480 : Ancho máximo de la miniatura WebP (thumbs/*.webp)}';
    protected $description = 'Generar variantes WebP (completa + miniatura reducida) para imágenes bajo public/data';

    public function handle(): int
    {
        $roots = [
            public_path('data/products'),
            public_path('data/categories'),
            public_path('data/banners'),
            public_path('data/texts'),
        ];

        $manager = new ImageManager(new Driver());
        $thumbWidth = max(1, (int) $this->option('thumb-width'));
        $thumbsDir = rtrim(config('variables.thumbs', 'thumbs/'), '/');
        $converted = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($roots as $root) {
            if (!is_dir($root)) {
                continue;
            }

            // Solo los originales de la carpeta raíz; las miniaturas se derivan de ellos
            foreach (File::files($root) as $file) {
                $ext = strtolower($file->getExtension());
                if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
                    continue;
                }

                $base = pathinfo($file->getFilename(), PATHINFO_FILENAME);
                $targets = [
                    // WebP completo (no se toca si el original ya es WebP)
                    'full' => $ext === 'webp' ? null : $root . DIRECTORY_SEPARATOR . $base . '.webp',
                    // Miniatura WebP reducida para tarjetas y mosaicos
                    'thumb' => $root . DIRECTORY_SEPARATOR . $thumbsDir . DIRECTORY_SEPARATOR . $base . '.webp',
                ];

                foreach ($targets as $kind => $target) {
                    if ($target === null) {
                        continue;
                    }
                    if (is_file($target) && !$this->option('force')) {
                        $skipped++;
                        continue;
                    }

                    try {
                        File::ensureDirectoryExists(dirname($target));
                        $image = $manager->read($file->getPathname());
                        if ($kind === 'thumb') {
                            $image->scaleDown(width: $thumbWidth);
                        }
                        $image->toWebp($kind === 'thumb' ? 78 : 80)->save($target);
                        $converted++;
                    } catch (\Throwable $e) {
                        $failed++;
                        $this->warn("Falló {$file->getPathname()} ({$kind}): {$e->getMessage()}");
                    }
                }
            }
        }

        $this->info("WebP generados: {$converted}; omitidos: {$skipped}; fallidos: {$failed}");

        return self::SUCCESS;
    }
}
