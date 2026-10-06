<?php

namespace App\Traits;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * Subida de archivos adjuntos: configuración de campos, validación de
 * tipo/tamaño y guardado en public/.
 */
trait FileUpload
{
    // Configuración de archivos
    public ?array $fileFields = null;
    public ?string $filePath = null;
    public ?array $allowedFileTypes = null;
    public ?int $maxFileSize = null; // en MB

    /**
     * Configurar campos de archivo con validación automática
     */
    public function configureFiles(
        array $fields,
        string $path,
        ?array $allowedTypes = null,
        ?int $maxSize = null
    ): void {
        $this->fileFields = $fields;
        $this->filePath = $path;
        $this->allowedFileTypes = $allowedTypes ?? ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar', 'mp4', 'mov', 'avi'];
        $this->maxFileSize = $maxSize ?? 10; // 10MB por defecto
    }

    /**
     * Procesar archivo con validación
     */
    private function processFile($file, string $field): string
    {
        // Validar tipo de archivo
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, $this->allowedFileTypes, true)) {
            throw new \Exception("Tipo de archivo no permitido: {$extension}");
        }

        // Validar tamaño
        if ($file->getSize() > $this->maxFileSize * 1024 * 1024) {
            throw new \Exception("El archivo excede el tamaño máximo de {$this->maxFileSize}MB");
        }

        $filename = Str::uuid().'.'.$extension;
        $relativeDir = $this->filePath;
        $absoluteDir = public_path($relativeDir);

        if (!File::exists($absoluteDir)) {
            File::makeDirectory($absoluteDir, 0755, true);
        }

        $file->move($absoluteDir, $filename);   // mueve el archivo subido a /public/...
        return $filename;
    }
}
