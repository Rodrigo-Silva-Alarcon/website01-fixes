<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use App\Services\WebContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin › Textos de la tienda: carrito, ficha de producto y mensajes de WhatsApp.
 */
class StoreTextController extends Controller
{
    public function index(): Response
    {
        $setting = StoreSetting::with('editor:id,name')->firstOrFail();

        return Inertia::render('admin/store-texts/Index', [
            'groups' => collect(StoreSetting::FIELDS)->map(fn (array $group, string $key) => [
                'key' => $key,
                'title' => $group['title'],
                'fields' => collect($group['fields'])->map(fn (array $field, string $name) => [
                    'name' => $name,
                    'label' => $field[0],
                    'max' => $field[1],
                    'default' => $field[2],
                ])->values(),
            ])->values(),
            'texts' => $setting->values(),
            'updatedAt' => $setting->updated_at,
            'editor' => $setting->editor,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $fields = StoreSetting::fieldList();
        $validated = $request->validate(
            array_map(fn (array $field) => ['required', 'string', 'max:'.$field[1]], $fields),
            [],
            array_map(fn (array $field) => mb_strtolower($field[0]), $fields),
        );

        $setting = StoreSetting::firstOrFail();
        $setting->texts = array_map('trim', $validated);

        if (! $setting->isDirty()) {
            return back()->with('success', 'No hubo cambios que guardar.');
        }

        $setting->updated_by = auth()->id();
        $setting->save();

        WebContentService::flushCache();

        return back()->with('success', 'Textos de la tienda actualizados.');
    }
}
