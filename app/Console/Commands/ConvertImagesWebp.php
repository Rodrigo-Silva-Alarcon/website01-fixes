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
        $bannersRoot = public_path(rtrim(config('variables.folder_banner'), '/'));
        $mdDir = rtrim(config('variables.banner_md', 'md/'), '/');
        $mdWidth = (int) config('variables.banner_md_width', 800);
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
                    // Banners: WebP mediano para el srcset del hero (solo si el original es más ancho)
                    'md' => $root === $bannersRoot ? $root . DIRECTORY_SEPARATOR . $mdDir . DIRECTORY_SEPARATOR . $base . '.webp' : null,
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
                        if ($kind === 'md') {
                            if ($image->width() <= $mdWidth) {
                                $skipped++;
                                continue;
                            }
                            $image->scaleDown(width: $mdWidth);
                        }
                        $image->toWebp($kind === 'full' ? 80 : 78)->save($target);
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
