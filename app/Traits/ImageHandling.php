<?php

namespace App\Traits;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * Procesamiento de imágenes: configuración de campos, redimensionamiento,
 * miniaturas y variantes WebP.
 */
trait ImageHandling
{
    // Configuración de imágenes
    public ?array $imageFields = null;
    public ?string $imagePath = null;
    public ?int $imageWidth = null;
    public ?int $imageHeight = null;
    public ?bool $imageThumbnail = false;
    public ?int $thumbnailWidth = null;
    public ?int $thumbnailHeight = null;

    /**
     * Configurar campos de imagen con redimensionamiento automático
     */
    public function configureImages(
        array $fields,
        string $path,
        int $width,
        ?int $height = null,
        bool $thumbnail = false,
        ?int $thumbWidth = null,
        ?int $thumbHeight = null
    ): void {
        $this->imageFields = $fields;
        $this->imagePath = $path;
        $this->imageWidth = $width;
        $this->imageHeight = $height;
        $this->imageThumbnail = $thumbnail;
        $this->thumbnailWidth = $thumbWidth ?? $width;
        $this->thumbnailHeight = $thumbHeight ?? $height;
    }

    /**
     * Procesar imagen con redimensionamiento y thumbnail
     */
    private function processImage($file, string $field): string
    {
        try {
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $publicPath = $this->imagePath;
            $fullPath = public_path($publicPath);

            // Crear directorio si no existe
            if (!File::exists($fullPath)) {
                if (!File::makeDirectory($fullPath, 0755, true)) {
                    throw new \Exception("No se pudo crear el directorio para las imágenes");
                }
            }

            $filePath = $fullPath . $filename;

            // Crear manager de imagen con driver GD
            $manager = new ImageManager(new Driver());

            // Verificar que el archivo sea una imagen válida
            if (!$file->isValid()) {
                throw new \Exception("El archivo de imagen no es válido");
            }

            // Verificar que sea realmente una imagen
            $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            if (!in_array($file->getMimeType(), $allowedMimes)) {
                throw new \Exception("El archivo debe ser una imagen válida (JPEG, PNG, JPG, GIF)");
            }

            // Redimensionar imagen principal
            $image = $manager->read($file);
            //$image->resize($this->imageWidth, $this->imageHeight);
            $image->scale($this->imageWidth, $this->imageHeight);

            // Guardar imagen redimensionada directamente en public/data
            if (!$image->save($filePath)) {
                throw new \Exception("No se pudo guardar la imagen");
            }

            // Variantes WebP (misma base de nombre, extensión .webp)
            $webpPath = preg_replace('/\.[^.]+$/', '.webp', $filePath);
            try {
                $image->toWebp(82)->save($webpPath);
            } catch (\Throwable) {
                // WebP es best-effort; la imagen original ya quedó guardada.
            }

            // Crear thumbnail si está configurado
            if ($this->imageThumbnail) {
                $thumbPath = $fullPath . config('variables.thumbs');
                if (!File::exists($thumbPath)) {
                    if (!File::makeDirectory($thumbPath, 0755, true)) {
                        throw new \Exception("No se pudo crear el directorio para thumbnails");
                    }
                }

                $thumbnail = $manager->read($file);
                //$thumbnail->resize($this->thumbnailWidth, $this->thumbnailHeight);
                $thumbnail->scale($this->thumbnailWidth, $this->thumbnailHeight);

                if (!$thumbnail->save($thumbPath . $filename)) {
                    throw new \Exception("No se pudo guardar el thumbnail");
                }

                $thumbWebp = preg_replace('/\.[^.]+$/', '.webp', $thumbPath . $filename);
                try {
                    $thumbnail->toWebp(82)->save($thumbWebp);
                } catch (\Throwable) {
                    // best-effort
                }
            }

            return  $filename;

        } catch (\Exception $e) {
            // Lanzar excepción con mensaje específico para que se muestre en el frontend
            throw new \Exception("Error al procesar la imagen: " . $e->getMessage());
        }
    }
}
