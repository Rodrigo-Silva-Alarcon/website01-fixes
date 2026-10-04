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

        $folder = config('variables.folder_about');
        File::ensureDirectoryExists(public_path($folder));
        $name = Str::uuid()->toString();

        $manager = new ImageManager(new Driver());
        $picture = $manager->read($request->file('image')->getRealPath())->scaleDown(width: self::IMAGE_WIDTH);
        $picture->toWebp(80)->save(public_path("{$folder}{$name}.webp"));
        $picture->toJpeg(82, progressive: true)->save(public_path("{$folder}{$name}.jpg"));

        $old = $image->image;
        $image->update([
            'image' => "{$folder}{$name}.webp",
            'fallback' => "{$folder}{$name}.jpg",
            // Una foto nueva empieza centrada
            'focus_x' => 50,
            'focus_y' => 50,
            'updated_by' => auth()->id(),
        ]);
        AboutLog::record('image_replaced', "position_{$image->position}", $old, $image->image);

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

    /**
     * Guardado general de la galería: orden (el de la lista), encuadre y fotos nuevas de todas las
     * posiciones en una sola petición. Solo se registra en el historial lo que realmente cambió.
     */
    public function saveGallery(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'images' => ['required', 'array', 'size:'.AboutImage::SLOTS],
            'images.*.id' => ['required', 'integer', 'distinct', 'exists:about_images,id'],
            'images.*.focus_x' => ['required', 'integer', 'between:0,100'],
            'images.*.focus_y' => ['required', 'integer', 'between:0,100'],
            'images.*.image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
        ]);

        $items = array_values($validated['images']);
        $images = AboutImage::whereIn('id', array_column($items, 'id'))->get()->keyBy('id');
        $before = AboutImage::orderBy('position')->pluck('image', 'id')->all();
        $changes = 0;

        DB::transaction(function () use ($items, $images, $before, $request, &$changes) {
            $newOrder = array_map(fn ($item) => (int) $item['id'], $items);

            if (array_keys($before) !== $newOrder) {
                // Posición es única: se libera primero con valores temporales
                foreach ($newOrder as $index => $id) {
                    AboutImage::whereKey($id)->update(['position' => 100 + $index]);
                }
                foreach ($newOrder as $index => $id) {
                    AboutImage::whereKey($id)->update(['position' => $index + 1, 'updated_by' => auth()->id()]);
                }
                AboutLog::record('image_moved', null, array_values($before), array_map(fn ($id) => $before[$id], $newOrder));
                $changes++;
            }

            foreach ($items as $index => $item) {
                $image = $images[(int) $item['id']];
                $field = 'position_'.($index + 1);
                $focusX = (int) $item['focus_x'];
                $focusY = (int) $item['focus_y'];
                $values = [];

                if ($request->hasFile("images.{$index}.image")) {
                    [$webp, $jpg] = $this->storeImage($request->file("images.{$index}.image"));
                    AboutLog::record('image_replaced', $field, $image->image, $webp);
                    // El encuadre elegido para la foto nueva manda
                    $values = ['image' => $webp, 'fallback' => $jpg, 'focus_x' => $focusX, 'focus_y' => $focusY];
                    $changes++;
                } elseif ($image->focus_x !== $focusX || $image->focus_y !== $focusY) {
                    AboutLog::record('image_focus', $field, "{$image->focus_x}% {$image->focus_y}%", "{$focusX}% {$focusY}%");
                    $values = ['focus_x' => $focusX, 'focus_y' => $focusY];
                    $changes++;
                }

                if ($values) {
                    $image->update([...$values, 'updated_by' => auth()->id()]);
                }
            }
        });

        if (! $changes) {
            return back()->with('success', 'No hubo cambios que guardar.');
        }

        WebContentService::flushCache();

        return back()->with('success', 'Galería actualizada.');
    }

    /** Guarda la foto en WebP + JPG de respaldo y devuelve ambas rutas relativas. */
    private function storeImage(UploadedFile $file): array
    {
        $folder = config('variables.folder_about');
        File::ensureDirectoryExists(public_path($folder));
        $name = Str::uuid()->toString();

        $picture = (new ImageManager(new Driver()))->read($file->getRealPath())->scaleDown(width: self::IMAGE_WIDTH);
        $picture->toWebp(80)->save(public_path("{$folder}{$name}.webp"));
        $picture->toJpeg(82, progressive: true)->save(public_path("{$folder}{$name}.jpg"));

        return ["{$folder}{$name}.webp", "{$folder}{$name}.jpg"];
    }

    /** Nuevo orden de la galería: lista de ids en el orden de las posiciones 1..4. */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'images' => ['required', 'array', 'size:'.AboutImage::SLOTS],
            'images.*' => ['required', 'integer', 'distinct', 'exists:about_images,id'],
        ]);

        $before = AboutImage::orderBy('position')->pluck('id')->all();
        if ($before === array_map('intval', $validated['images'])) {
            return back();
        }

        DB::transaction(function () use ($validated) {
            // Posición es única: se libera primero con valores temporales
            foreach ($validated['images'] as $index => $id) {
                AboutImage::whereKey($id)->update(['position' => 100 + $index]);
            }
            foreach ($validated['images'] as $index => $id) {
                AboutImage::whereKey($id)->update(['position' => $index + 1, 'updated_by' => auth()->id()]);
            }
        });

        $paths = AboutImage::whereIn('id', $before)->pluck('image', 'id');
        AboutLog::record(
            'image_moved',
            null,
            array_map(fn ($id) => $paths[$id], $before),
            array_map(fn ($id) => $paths[(int) $id], $validated['images']),
        );

        WebContentService::flushCache();

        return back()->with('success', 'Orden de la galería actualizado.');
    }
}
