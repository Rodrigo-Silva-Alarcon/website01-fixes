<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Facades\File;

/**
 * Trait avanzado para simplificar operaciones CRUD
 * Maneja automáticamente: imágenes, archivos, hashes, búsquedas, ordenamiento, paginación
 */
trait PostTrait
{
    // Configuración de imágenes
    public ?array $imageFields = null;
    public ?string $imagePath = null;
    public ?int $imageWidth = null;
    public ?int $imageHeight = null;
    public ?bool $imageThumbnail = false;
    public ?int $thumbnailWidth = null;
    public ?int $thumbnailHeight = null;
    public array $appends = [];

    // Configuración de archivos
    public ?array $fileFields = null;
    public ?string $filePath = null;
    public ?array $allowedFileTypes = null;
    public ?int $maxFileSize = null; // en MB

    // Configuración de campos a hashear
    public ?array $hashFields = null;

    // Configuración de búsqueda y ordenamiento
    public ?array $searchableFields = null;
    public ?array $sortableFields = null;
    public ?string $defaultSortField = 'id';
    public ?string $defaultSortOrder = 'asc';

    // Configuración de paginación
    public ?int $perPage = 20;

    // Configuración de relaciones
    public ?array $withRelations = null;
    public ?array $withCountRelations = null;

    // Configuración de campos checkbox/radio
    public ?array $checkboxFields = null;
    public ?array $radioFields = null;

    // Configuración de campos a excluir en updates
    public ?array $excludeFields = null;

    // Configuración de validación personalizada
    public ?array $customValidationRules = null;

    /**
     * Configurar campos de imagen con redimensionamiento automático
     */
    public function configureImages(
        array $fields,
        string $path,
        int $width,
        int $height = null,
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
     * Configurar campos a hashear automáticamente
     */
    public function configureHashes(array $fields): void
    {
        $this->hashFields = $fields;
    }

    /**
     * Configurar campos de búsqueda
     */
    public function configureSearchable(array $fields): void
    {
        $this->searchableFields = $fields;
    }

    /**
     * Configurar campos ordenables
     */
    public function configureSortable(array $fields, ?string $defaultField = null, ?string $defaultOrder = null): void
    {
        $this->sortableFields = $fields;
        $this->defaultSortField = $defaultField ?? 'id';
        $this->defaultSortOrder = $defaultOrder ?? 'asc';
    }

    /**
     * Configurar paginación
     */
    public function configurePagination(int $perPage): void
    {
        $this->perPage = $perPage;
    }

    /**
     * Configurar relaciones a cargar
     */
    public function configureRelations(array $relations): void
    {
        $this->withRelations = $relations;
    }

    /**
     * Configurar relaciones con conteo
     */
    public function configureWithCount(array $relations): void
    {
        $this->withCountRelations = $relations;
    }

    /**
     * Configurar accessors para incluir en respuestas
     */
    public function configureAppends(array $appends): void
    {
        $this->appends = $appends;
    }

    /**
     * Configurar campos checkbox
     */
    public function configureCheckboxes(array $fields): void
    {
        $this->checkboxFields = $fields;
    }

    /**
     * Configurar campos radio
     */
    public function configureRadios(array $fields): void
    {
        $this->radioFields = $fields;
    }

    /**
     * Configurar campos a excluir en updates
     */
    public function configureExcludeFields(array $fields): void
    {
        $this->excludeFields = $fields;
    }

    /**
     * Configurar reglas de validación personalizadas
     */
    public function configureCustomValidation(array $rules): void
    {
        $this->customValidationRules = $rules;
    }

    /**
     * Método principal para listar con filtros automáticos
     */
    public function indexWithFilters(Request $request, string $modelClass, string $view, array $extraData = []): \Inertia\Response
    {
        $query = $modelClass::query();
        
        // Cargar relaciones si están configuradas
        if ($this->withRelations) {
            $query->with($this->withRelations);
        }

        // Cargar relaciones con conteo si están configuradas
        if ($this->withCountRelations) {
            $query->withCount($this->withCountRelations);
        }

        // Aplicar búsqueda automática
        if ($request->filled('search') && $this->searchableFields) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                foreach ($this->searchableFields as $field) {
                    $q->orWhere($field, 'like', "%{$search}%");
                }
            });
        }

        // Aplicar filtros adicionales
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->get('category_id'));
        }
        if ($request->filled('subcategory_id')) {
            $query->where('subcategory_id', $request->get('subcategory_id'));
        }

        // Aplicar ordenamiento automático
        $sortBy = $request->get('sort_by', $this->defaultSortField);
        $sortOrder = $request->get('sort_order', $this->defaultSortOrder);
        
        if ($this->sortableFields && in_array($sortBy, $this->sortableFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy($this->defaultSortField, $this->defaultSortOrder);
        }

        // Aplicar paginación automática
        $records = $query->paginate($this->perPage)->withQueryString();
        
        // Incluir accessors si están configurados
        if (!empty($this->appends)) {
            $records->getCollection()->transform(function ($item) {
                return $item->append($this->appends);
            });
        }

        $data = array_merge([
            'records' => $records,
            'filters' => $request->only(['search', 'sort_by', 'sort_order', 'category_id', 'subcategory_id']),
        ], $extraData);

        return Inertia::render($view, $data);
    }

    /**
     * Crear registro con procesamiento automático
     */
    public function createRecord(FormRequest $request, Model $model, array $extraData = []): Model
    {
        $payload = array_merge($request->validated(), $extraData);

        $record = $model->fill($payload);

        // Procesar imágenes
        if ($this->imageFields) {
            foreach ($this->imageFields as $field) {
                if ($request->hasFile($field)) {
                    $record->{$field} = $this->processImage($request->file($field), $field);
                }
            }
        }

        // Procesar archivos
        if ($this->fileFields) {
            foreach ($this->fileFields as $field) {
                if ($request->hasFile($field)) {
                    $record->{$field} = $this->processFile($request->file($field), $field);
                }
            }
        }

        // Procesar hashes
        if ($this->hashFields) {
            foreach ($this->hashFields as $field) {
                if (isset($record->{$field}) && !empty($record->{$field})) {
                    $record->{$field} = Hash::make($record->{$field});
                }
            }
        }

        // Procesar checkboxes
        if ($this->checkboxFields) {
            foreach ($this->checkboxFields as $field) {
                $record->{$field} = $request->has($field) ? 1 : 0;
            }
        }

        // Procesar radios
        if ($this->radioFields) {
            foreach ($this->radioFields as $field) {
                if ($request->has($field)) {
                    $record->{$field} = $request->input($field);
                }
            }
        }

        try {
            $record->save();
            return $record;
        } catch (\Exception $e) {
            // Si es un error de imagen, lanzar excepción específica
            if (str_contains($e->getMessage(), 'Error al procesar la imagen')) {
                throw new \Exception($e->getMessage());
            }
            
            // Para otros errores, lanzar excepción genérica
            throw new \Exception('Error al crear el registro: ' . $e->getMessage());
        }
    }

    /**
     * Actualizar registro con procesamiento automático
     */
    public function updateRecord(FormRequest $request, Model $model, array $extraData = []): bool
    {
        $oldFiles = $this->getOldFiles($model);

        $payload = array_merge($request->validated(), $extraData);
        
        // Excluir campos de imagen del payload para evitar sobrescribir con valores vacíos
        if ($this->imageFields) {
            foreach ($this->imageFields as $field) {
                unset($payload[$field]);
            }
        }
        if ($this->fileFields) {
            foreach ($this->fileFields as $field) {
                unset($payload[$field]);
            }
        }
        

        $model = $model->fill($payload);

        // Procesar imágenes
        if ($this->imageFields) {
            foreach ($this->imageFields as $field) {
                // Verificar si se quiere eliminar la imagen existente
                $eliminarField = 'eliminar_' . $field;
                if ($request->has($eliminarField) && $request->input($eliminarField)) {
                    // Eliminar imagen existente
                    $model->{$field} = null;
                    $this->deleteOldFile($oldFiles[$field] ?? null);
                } elseif ($request->hasFile($field)) {
                    // Solo procesar si se subió una nueva imagen
                    $model->{$field} = $this->processImage($request->file($field), $field);
                    $this->deleteOldFile($oldFiles[$field] ?? null);
                }
                // Si no hay archivo nuevo ni se quiere eliminar, mantener el valor original del modelo (no modificar)
            }
        }

        // Procesar archivos
        if ($this->fileFields) {
            foreach ($this->fileFields as $field) {
                if ($request->hasFile($field)) {
                    $model->{$field} = $this->processFile($request->file($field), $field);
                    $this->deleteOldFile($oldFiles[$field] ?? null);
                }
            }
        }

        // Procesar hashes
        if ($this->hashFields) {
            foreach ($this->hashFields as $field) {
                if (isset($model->{$field}) && !empty($model->{$field})) {
                    $model->{$field} = Hash::make($model->{$field});
                }
            }
        }

        // Procesar checkboxes
        if ($this->checkboxFields) {
            foreach ($this->checkboxFields as $field) {
                $model->{$field} = $request->has($field) ? 1 : 0;
            }
        }

        // Procesar radios
        if ($this->radioFields) {
            foreach ($this->radioFields as $field) {
                if ($request->has($field)) {
                    $model->{$field} = $request->input($field);
                }
            }
        }

        // Excluir campos específicos
        if ($this->excludeFields) {
            foreach ($this->excludeFields as $field) {
                unset($model->{$field});
            }
        }

        try {
            return (bool) $model->update();
        } catch (\Exception $e) {
            // Si es un error de imagen, lanzar excepción específica
            if (str_contains($e->getMessage(), 'Error al procesar la imagen')) {
                throw new \Exception($e->getMessage());
            }
            
            // Para otros errores, lanzar excepción genérica
            throw new \Exception('Error al actualizar el registro: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar registro con limpieza automática de archivos
     */
    public function destroyRecord(Model $model): void
    {
        $oldFiles = $this->getOldFiles($model);
        $model->delete();
        $this->deleteOldFiles($oldFiles);
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
            }

            return  $filename;
            
        } catch (\Exception $e) {
            // Lanzar excepción con mensaje específico para que se muestre en el frontend
            throw new \Exception("Error al procesar la imagen: " . $e->getMessage());
        }
    }

    /**
     * Procesar archivo con validación
     */
    private function processFile($file, string $field): string
    {
        // Validar tipo de archivo
        $extension = $file->getClientOriginalExtension();
        if (!in_array($extension, $this->allowedFileTypes)) {
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

    /**
     * Obtener archivos antiguos del modelo
     */
    private function getOldFiles(Model $model): array
    {
        $oldFiles = [];

        if ($this->imageFields) {
            foreach ($this->imageFields as $field) {
                $oldFiles[$field] = $model->{$field};
            }
        }

        if ($this->fileFields) {
            foreach ($this->fileFields as $field) {
                $oldFiles[$field] = $model->{$field};
            }
        }

        return $oldFiles;
    }

    /**
     * Eliminar archivo antiguo
     */
    private function deleteOldFile(?string $filePath): void
    {
        if ($filePath) {
            $fullPath = public_path($filePath);
            if (File::exists($fullPath)) {
                File::delete($fullPath);
            }            
            // Eliminar thumbnail si existe
            if ($this->imageThumbnail) {
                $thumbPath = str_replace(basename($filePath), config('variables.thumbs') . basename($filePath), $fullPath);
                if (File::exists($thumbPath)) {
                    File::delete($thumbPath);
                }
            }
        }
    }

    /**
     * Eliminar archivos antiguos
     */
    private function deleteOldFiles(array $files): void
    {
        foreach ($files as $filename) {
            $this->deleteOldFile($filename);
        }
    }

    /**
     * Generar reglas de validación automáticas
     */
    public function generateValidationRules(string $action = 'create'): array
    {
        $rules = [];

        // Reglas para imágenes
        if ($this->imageFields) {
            foreach ($this->imageFields as $field) {
                $rules[$field] = 'image|mimes:jpeg,png,jpg,gif|max:' . ($this->maxFileSize ?? 5) * 1024;
            }
        }

        // Reglas para archivos
        if ($this->fileFields) {
            foreach ($this->fileFields as $field) {
                $rules[$field] = 'file|mimes:' . implode(',', $this->allowedFileTypes) . '|max:' . ($this->maxFileSize ?? 10) * 1024;
            }
        }

        // Reglas personalizadas
        if ($this->customValidationRules) {
            $rules = array_merge($rules, $this->customValidationRules);
        }

        return $rules;
    }
}
