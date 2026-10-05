<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FooterSetting;
use App\Services\WebContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin › Footer: logo (modo claro / modo oscuro o uno solo transparente) y textos del pie de página.
 */
class FooterController extends Controller
{
    /** Ancho máximo del logo guardado (se muestra a 72 px de alto). */
    private const LOGO_WIDTH = 800;

    public function index(): Response
    {
        return Inertia::render('admin/footer/Index', [
            'footer' => FooterSetting::with('editor:id,name')->firstOrFail(),
            'defaultLogo' => FooterSetting::DEFAULT_LOGO,
            'yearToken' => FooterSetting::YEAR_TOKEN,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $image = ['nullable', 'file', 'mimes:png,webp,jpg,jpeg', 'max:4096'];
        $validated = $request->validate([
            'logo_light' => $image,
            'logo_dark' => $image,
            'remove_logo_light' => ['boolean'],
            'remove_logo_dark' => ['boolean'],
            'logo_transparent' => ['boolean'],
            'logo_alt' => ['required', 'string', 'max:150'],
            'copyright' => ['required', 'string', 'max:200'],
            'credits' => ['nullable', 'string', 'max:120'],
        ], [
            'logo_light.mimes' => 'El logo debe ser PNG, WebP o JPG.',
            'logo_dark.mimes' => 'El logo debe ser PNG, WebP o JPG.',
            'logo_light.max' => 'El logo no debe superar los 4 MB.',
            'logo_dark.max' => 'El logo no debe superar los 4 MB.',
            'logo_light.uploaded' => 'No se pudo subir el logo: supera el tamaño que admite el servidor.',
            'logo_dark.uploaded' => 'No se pudo subir el logo: supera el tamaño que admite el servidor.',
        ], [
            'logo_light' => 'logo para modo claro',
            'logo_dark' => 'logo para modo oscuro',
            'logo_alt' => 'texto alternativo',
            'copyright' => 'texto de derechos',
            'credits' => 'créditos',
        ]);

        $footer = FooterSetting::firstOrFail();
        $footer->fill([
            'logo_transparent' => $request->boolean('logo_transparent'),
            'logo_alt' => $validated['logo_alt'],
            'copyright' => $validated['copyright'],
            'credits' => $validated['credits'] ?? null,
        ]);

        foreach (['light', 'dark'] as $mode) {
            if ($file = $request->file("logo_{$mode}")) {
                [$webp, $png] = $this->storeLogo($file);
                $footer->fill(["logo_{$mode}" => $webp, "logo_{$mode}_fallback" => $png]);
            } elseif ($request->boolean("remove_logo_{$mode}")) {
                $footer->fill(["logo_{$mode}" => null, "logo_{$mode}_fallback" => null]);
            }
        }

        if (! $footer->isDirty()) {
            return back()->with('success', 'No hubo cambios que guardar.');
        }

        // Los archivos reemplazados se borran solo después de guardar la fila
        $replaced = collect(['logo_light', 'logo_light_fallback', 'logo_dark', 'logo_dark_fallback'])
            ->filter(fn ($field) => $footer->isDirty($field))
            ->map(fn ($field) => $footer->getOriginal($field))
            ->filter();

        $footer->updated_by = auth()->id();
        $footer->save();

        foreach ($replaced as $path) {
            File::delete(public_path($path));
        }

        WebContentService::flushCache();

        return back()->with('success', 'Footer actualizado.');
    }

    /** Guarda el logo en WebP + PNG de respaldo, ambos con su transparencia. */
    private function storeLogo(UploadedFile $file): array
    {
        $folder = config('variables.folder_footer');
        File::ensureDirectoryExists(public_path($folder));
        $name = Str::uuid()->toString();

        $logo = (new ImageManager(new Driver()))->read($file->getRealPath())->scaleDown(width: self::LOGO_WIDTH);
        $logo->toWebp(90)->save(public_path("{$folder}{$name}.webp"));
        $logo->toPng()->save(public_path("{$folder}{$name}.png"));

        return ["{$folder}{$name}.webp", "{$folder}{$name}.png"];
    }
}
