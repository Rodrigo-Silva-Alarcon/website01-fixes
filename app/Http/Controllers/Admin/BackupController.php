<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\BackupService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

/**
 * Admin › Copias de seguridad: lista, crear una copia ahora y descargar.
 * Restaurar solo se hace por consola (php artisan backup:restore).
 */
class BackupController extends Controller
{
    public function __construct(private BackupService $backups) {}

    public function index(): Response
    {
        $database = array_map(fn ($b) => [
            'name' => $b['name'],
            'size' => $b['size'],
            'created_at' => $b['created_at']->toIso8601String(),
            'label' => $b['label'],
        ], $this->backups->databaseBackups());

        $images = $this->backups->imagesBackup();

        return Inertia::render('admin/backups/Index', [
            'database' => $database,
            'images' => $images ? [
                'name' => $images['name'],
                'size' => $images['size'],
                'created_at' => $images['created_at']->toIso8601String(),
            ] : null,
            'retention' => config('backups.retention'),
        ]);
    }

    public function store(): RedirectResponse
    {
        try {
            $backup = $this->backups->backupDatabase('manual');
        } catch (Throwable $e) {
            report($e);

            return back()->with('error', 'No se pudo crear la copia: '.$e->getMessage());
        }

        return back()->with('success', "Copia creada: {$backup['name']}");
    }

    public function storeImages(): RedirectResponse
    {
        try {
            $backup = $this->backups->backupImages();
        } catch (Throwable $e) {
            report($e);

            return back()->with('error', 'No se pudo crear la copia de imágenes: '.$e->getMessage());
        }

        return back()->with('success', "Copia de imágenes creada ({$backup['files']} archivos)");
    }

    public function download(string $name): BinaryFileResponse
    {
        try {
            $file = $this->backups->resolveFile($name);
        } catch (RuntimeException) {
            abort(404);
        }

        return response()->download($file, $name);
    }
}
