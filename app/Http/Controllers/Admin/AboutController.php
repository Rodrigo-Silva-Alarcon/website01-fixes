<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AboutImage;
use App\Models\AboutLog;
use App\Models\AboutPage;
use App\Services\WebContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin › Nosotros: textos, galería (imagen, encuadre, orden) e historial de cambios.
 * Cada guardado registra en about_logs solo lo que realmente cambió.
 */
class AboutController extends Controller
{
    /** Ancho máximo con que se guardan las fotos (las tarjetas miden ~330px; 2x para pantallas retina). */
    private const IMAGE_WIDTH = 1200;

    public function index(Request $request): Response
    {
        $logs = AboutLog::query()
            ->when($request->filled('action'), fn ($q) => $q->where('action', $request->string('action')))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/about/Index', [
            'page' => AboutPage::with('editor:id,name')->firstOrFail(),
            'images' => AboutImage::with('editor:id,name')->orderBy('position')->get(),
            'logs' => $logs,
            'actions' => AboutLog::ACTIONS,
            'fields' => AboutPage::FIELDS,
            'filters' => ['action' => $request->input('action', '')],
            'tab' => $request->input('tab', 'texts'),
        ]);
    }

    public function updateTexts(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'title_highlight' => ['nullable', 'string', 'max:60'],
            'intro' => ['required', 'string', 'max:1500'],
            'mission_title' => ['required', 'string', 'max:60'],
            'mission' => ['required', 'string', 'max:1500'],
            'vision_title' => ['required', 'string', 'max:60'],
            'vision' => ['required', 'string', 'max:1500'],
        ]);

        $page = AboutPage::firstOrFail();
        $changes = 0;

        DB::transaction(function () use ($page, $validated, &$changes) {
            foreach (array_keys(AboutPage::FIELDS) as $field) {
                $new = $validated[$field] ?? null;
                if ((string) $page->$field !== (string) $new) {
                    AboutLog::record('text_updated', $field, $page->$field, $new);
                    $changes++;
                }
            }

            if ($changes) {
                $page->update([...$validated, 'updated_by' => auth()->id()]);
            }
        });

        if (! $changes) {
            return back()->with('success', 'No hubo cambios que guardar.');
        }

        WebContentService::flushCache();

        return back()->with('success', 'Textos de Nosotros actualizados.');
    }

    /** Reemplaza la foto de una posición: se guarda en WebP + JPG de respaldo; la anterior se conserva para el historial. */
    public function replaceImage(Request $request, AboutImage $image): RedirectResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
        ]);

        // Una foto nueva empieza centrada
        $this->storePicture($image, $request->file('image'), 50, 50);

        WebContentService::flushCache();

        return back()->with('success', "Imagen {$image->position} reemplazada.");
    }

    /** Encuadre (punto focal) y texto alternativo de una foto. */
    public function updateImage(Request $request, AboutImage $image): RedirectResponse
    {
        $validated = $request->validate([
            'focus_x' => ['required', 'integer', 'between:0,100'],
            'focus_y' => ['required', 'integer', 'between:0,100'],
            'alt' => ['required', 'string', 'max:150'],
        ]);

        $field = "position_{$image->position}";
        $changed = false;

        if ($image->focus_x !== (int) $validated['focus_x'] || $image->focus_y !== (int) $validated['focus_y']) {
            AboutLog::record('image_focus', $field, "{$image->focus_x}% {$image->focus_y}%", "{$validated['focus_x']}% {$validated['focus_y']}%");
            $changed = true;
        }
        if ($image->alt !== $validated['alt']) {
            AboutLog::record('image_alt', $field, $image->alt, $validated['alt']);
            $changed = true;
        }

        if (! $changed) {
            return back()->with('success', 'No hubo cambios que guardar.');
        }

        $image->update([...$validated, 'updated_by' => auth()->id()]);
        WebContentService::flushCache();

        return back()->with('success', "Imagen {$image->position} actualizada.");
    }

    /** Nuevo orden de la galería: lista de ids en el orden de las posiciones 1..4. */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'images' => ['required', 'array', 'size:'.AboutImage::SLOTS],
            'images.*' => ['required', 'integer', 'distinct', 'exists:about_images,id'],
        ]);

        if (! $this->applyOrder($validated['images'])) {
            return back();
        }

        WebContentService::flushCache();

        return back()->with('success', 'Orden de la galería actualizado.');
    }

    /**
     * Guarda de una vez todo lo editado en la galería: fotos nuevas, encuadre, texto alternativo y orden.
     * `images` llega en el orden de las posiciones 1..4; `file` solo viene en las fotos reemplazadas.
     */
    public function saveGallery(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'images' => ['required', 'array', 'size:'.AboutImage::SLOTS],
            'images.*.id' => ['required', 'integer', 'distinct', 'exists:about_images,id'],
            'images.*.focus_x' => ['required', 'integer', 'between:0,100'],
            'images.*.focus_y' => ['required', 'integer', 'between:0,100'],
            'images.*.alt' => ['required', 'string', 'max:150'],
            'images.*.file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
        ], [
            // :position = número de la foto (1..4), para que nunca aparezca el nombre técnico "images.0.file"
            'images.*.alt.required' => 'La foto :position necesita un texto alternativo.',
            'images.*.alt.max' => 'El texto alternativo de la foto :position no debe superar los 150 caracteres.',
            'images.*.file.max' => 'La foto :position supera el máximo de 8 MB.',
            'images.*.file.mimes' => 'La foto :position tiene un formato no admitido: usa JPG, PNG o WebP.',
            'images.*.file.uploaded' => 'No se pudo subir la foto :position: supera el tamaño que admite el servidor. Comprímela e intenta de nuevo.',
            'images.*.file.file' => 'No se pudo subir la foto :position. Intenta de nuevo.',
        ]);

        $changed = false;
        $current = AboutImage::whereIn('id', array_column($validated['images'], 'id'))->get()->keyBy('id');

        foreach ($validated['images'] as $index => $data) {
            $image = $current[(int) $data['id']];
            $focusX = (int) $data['focus_x'];
            $focusY = (int) $data['focus_y'];
            $file = $request->file("images.{$index}.file");

            if ($file) {
                // El encuadre de una foto nueva no se compara con el de la anterior
                $this->storePicture($image, $file, $focusX, $focusY);
                $changed = true;
            } elseif ($image->focus_x !== $focusX || $image->focus_y !== $focusY) {
                AboutLog::record('image_focus', "position_{$image->position}", "{$image->focus_x}% {$image->focus_y}%", "{$focusX}% {$focusY}%");
                $image->fill(['focus_x' => $focusX, 'focus_y' => $focusY]);
            }

            if ($image->alt !== $data['alt']) {
                AboutLog::record('image_alt', "position_{$image->position}", $image->alt, $data['alt']);
                $image->alt = $data['alt'];
            }

            if ($image->isDirty()) {
                $image->updated_by = auth()->id();
                $image->save();
                $changed = true;
            }
        }

        if ($this->applyOrder(array_column($validated['images'], 'id'))) {
            $changed = true;
        }

        if (! $changed) {
            return back()->with('success', 'No hubo cambios que guardar.');
        }

        WebContentService::flushCache();

        return back()->with('success', 'Galería actualizada.');
    }

    /** Guarda la foto en WebP + JPG de respaldo; la anterior se conserva en disco para el historial. */
    private function storePicture(AboutImage $image, UploadedFile $file, int $focusX, int $focusY): void
    {
        $folder = config('variables.folder_about');
        File::ensureDirectoryExists(public_path($folder));
        $name = Str::uuid()->toString();

        $manager = new ImageManager(new Driver());
        $picture = $manager->read($file->getRealPath())->scaleDown(width: self::IMAGE_WIDTH);
        $picture->toWebp(80)->save(public_path("{$folder}{$name}.webp"));
        $picture->toJpeg(82, progressive: true)->save(public_path("{$folder}{$name}.jpg"));

        $old = $image->image;
        $image->update([
            'image' => "{$folder}{$name}.webp",
            'fallback' => "{$folder}{$name}.jpg",
            'focus_x' => $focusX,
            'focus_y' => $focusY,
            'updated_by' => auth()->id(),
        ]);
        AboutLog::record('image_replaced', "position_{$image->position}", $old, $image->image);
    }

    /** Aplica el orden (ids de las posiciones 1..4) y lo registra; devuelve false si no cambió nada. */
    private function applyOrder(array $ids): bool
    {
        $ids = array_map('intval', $ids);
        $before = AboutImage::orderBy('position')->pluck('id')->all();
        if ($before === $ids) {
            return false;
        }

        DB::transaction(function () use ($ids) {
            // Posición es única: se libera primero con valores temporales
            foreach ($ids as $index => $id) {
                AboutImage::whereKey($id)->update(['position' => 100 + $index]);
            }
            foreach ($ids as $index => $id) {
                AboutImage::whereKey($id)->update(['position' => $index + 1, 'updated_by' => auth()->id()]);
            }
        });

        $paths = AboutImage::whereIn('id', $before)->pluck('image', 'id');
        AboutLog::record(
            'image_moved',
            null,
            array_map(fn ($id) => $paths[$id], $before),
            array_map(fn ($id) => $paths[$id], $ids),
        );

        return true;
    }
}
