<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\HomeSection;
use App\Models\Product;
use App\Traits\PostTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin › Página de inicio: orden, visibilidad, alta, edición y baja de las secciones del inicio.
 * La caché pública se limpia sola al guardar/eliminar (observer en AppServiceProvider).
 */
class HomeSectionController extends Controller
{
    use PostTrait;

    public function index(): Response
    {
        $sections = HomeSection::orderBy('position')->orderBy('id')->get();

        // Productos elegidos (manual y tarjetas) en una sola consulta, para mostrarlos en el editor
        $ids = $sections->flatMap(fn (HomeSection $s) => $s->productIds())->unique()->values();
        $products = $this->pickerQuery()->whereIn('id', $ids)->get()->map(fn (Product $p) => $this->pickerItem($p))->keyBy('id');

        return Inertia::render('admin/home/Index', [
            'sections' => $sections->map(fn (HomeSection $s) => [
                ...$s->only(['id', 'type', 'title', 'subtitle', 'position', 'active', 'locked']),
                'settings' => (object) ($s->settings ?? []),
                'products' => collect($s->productIds())->map(fn ($id) => $products->get($id))->filter()->values(),
            ]),
            'categories' => Category::orderBy('order')->orderByDesc('id')->get(['id', 'name', 'active', 'image'])
                ->map(fn (Category $c) => [
                    ...$c->only(['id', 'name', 'active']),
                    'image' => $c->image ? ($c->image_thumbs_webp_url ?: $c->image_thumbs_url) : null,
                ]),
            'types' => HomeSection::TYPES,
            'sources' => HomeSection::SOURCES,
            'maxProducts' => HomeSection::MAX_PRODUCTS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $type = $data['type'];

        if (HomeSection::TYPES[$type]['single'] && HomeSection::where('type', $type)->exists()) {
            return back()->with('error', 'Esa sección ya está en la página de inicio.');
        }

        HomeSection::create([
            ...$data,
            'position' => (int) HomeSection::max('position') + 1,
            'active' => $data['active'] ?? true,
        ]);

        return back()->with('success', 'Sección agregada al final de la página.');
    }

    public function update(Request $request, HomeSection $section): RedirectResponse
    {
        $data = $this->validated($request, $section);
        if ($section->locked) {
            $data['active'] = true;
        }

        $section->update($data);

        return back()->with('success', 'Sección actualizada.');
    }

    public function destroy(HomeSection $section): RedirectResponse
    {
        if ($section->locked) {
            return back()->with('error', 'Esta sección no se puede eliminar.');
        }

        $section->delete();

        return back()->with('success', 'Sección eliminada.');
    }

    public function toggle(HomeSection $section): RedirectResponse
    {
        if ($section->locked) {
            return back()->with('error', 'Esta sección siempre está visible.');
        }

        $section->update(['active' => ! $section->active]);

        return back()->with('success', $section->active ? 'Sección visible en la web.' : 'Sección oculta.');
    }

    /** Nuevo orden: lista completa de ids de arriba hacia abajo. */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'sections' => ['required', 'array'],
            'sections.*' => ['required', 'integer', 'distinct', 'exists:home_sections,id'],
        ]);

        DB::transaction(function () use ($validated) {
            foreach (array_values($validated['sections']) as $index => $id) {
                HomeSection::whereKey($id)->update(['position' => $index + 1]);
            }
        });
        // update() masivo no dispara el observer
        \App\Services\WebContentService::flushCache();

        return back()->with('success', 'Orden actualizado.');
    }

    /** Sube o reemplaza la imagen de una categoría (la que se ve en el mosaico «Explora por categoría»). */
    public function categoryImage(Request $request, Category $category): RedirectResponse
    {
        $request->validate(
            ['image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120']],
            ['image.required' => 'Elige una imagen.', 'image.max' => 'La imagen no puede pesar más de 5 MB.'],
            ['image' => 'imagen'],
        );

        $this->configureCategoryImages();
        try {
            $filename = $this->processImage($request->file('image'), 'image');
        } catch (\Throwable $e) {
            throw $this->uploadError('image', $e);
        }

        $this->deleteOldFiles($this->getOldFiles($category));
        $category->update(['image' => $filename]);

        return back()->with('success', "Imagen de «{$category->name}» actualizada.");
    }

    /** Quita la imagen de una categoría: el mosaico vuelve a la ilustración por defecto (o queda sin imagen). */
    public function destroyCategoryImage(Category $category): RedirectResponse
    {
        if (! $category->image) {
            return back()->with('error', 'Esta categoría no tiene imagen.');
        }

        $this->configureCategoryImages();
        $this->deleteOldFiles($this->getOldFiles($category));
        $category->update(['image' => null]);

        return back()->with('success', "Imagen de «{$category->name}» eliminada.");
    }

    /** Mismo tamaño y miniaturas que Admin › Categorías. */
    private function configureCategoryImages(): void
    {
        $this->configureImages(['image'], config('variables.folder_category'), 900, null, true, 300, null);
    }

    /** Buscador de productos para el editor (nombre, marca o categoría). */
    public function products(Request $request): JsonResponse
    {
        $term = trim((string) $request->query('q', ''));

        $products = $this->pickerQuery()
            ->where('active', true)
            ->when($term !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('name', 'like', "%{$term}%")
                ->orWhereHas('brand', fn ($b) => $b->where('name', 'like', "%{$term}%"))
                ->orWhereHas('category', fn ($c) => $c->where('name', 'like', "%{$term}%"))))
            ->orderBy('order')->orderByDesc('id')
            ->limit(20)
            ->get();

        return response()->json($products->map(fn (Product $p) => $this->pickerItem($p)));
    }

    private function validated(Request $request, ?HomeSection $section = null): array
    {
        $type = $section?->type ?? $request->input('type');

        $rules = [
            'title' => [$type === 'products' ? 'required' : 'nullable', 'string', 'max:120'],
            'subtitle' => ['nullable', 'string', 'max:80'],
            'active' => ['sometimes', 'boolean'],
        ];
        if (! $section) {
            $rules['type'] = ['required', Rule::in(array_keys(HomeSection::TYPES))];
        }

        if ($type === 'products') {
            $rules += [
                'settings.source' => ['required', Rule::in(array_keys(HomeSection::SOURCES))],
                'settings.category_id' => ['nullable', 'required_if:settings.source,category', 'integer', 'exists:categories,id'],
                'settings.limit' => ['nullable', 'integer', 'between:1,'.HomeSection::MAX_PRODUCTS],
                'settings.product_ids' => ['nullable', 'required_if:settings.source,manual', 'array', 'max:'.HomeSection::MAX_PRODUCTS],
                'settings.product_ids.*' => ['integer', 'distinct', 'exists:products,id'],
            ];
        } elseif ($type === 'promo') {
            $rules += [
                'settings.product_ids' => ['required', 'array', 'size:2'],
                'settings.product_ids.*' => ['integer', 'distinct', 'exists:products,id'],
            ];
        }

        $data = $request->validate($rules, [
            'settings.product_ids.required_if' => 'Elige al menos un producto.',
            'settings.product_ids.size' => 'Elige un producto para cada tarjeta.',
            'settings.product_ids.*.distinct' => 'No repitas el mismo producto.',
            'settings.category_id.required_if' => 'Elige una categoría.',
        ], [
            'title' => 'título',
            'settings.source' => 'origen',
            'settings.limit' => 'cantidad',
        ]);

        // Solo se guarda lo que aplica al origen elegido
        $settings = [];
        if ($type === 'products') {
            $source = $data['settings']['source'];
            $settings = ['source' => $source];
            if ($source === 'manual') {
                $settings['product_ids'] = array_map('intval', $data['settings']['product_ids']);
            } else {
                $settings['limit'] = (int) ($data['settings']['limit'] ?? 8);
            }
            if ($source === 'category') {
                $settings['category_id'] = (int) $data['settings']['category_id'];
            }
        } elseif ($type === 'promo') {
            $settings = ['product_ids' => array_map('intval', $data['settings']['product_ids'])];
        }

        unset($data['settings']);

        return [...$data, 'settings' => $settings];
    }

    private function pickerQuery()
    {
        return Product::query()
            ->select(['id', 'name', 'image', 'active', 'category_id', 'subcategory_id', 'brand_id', 'slug'])
            ->with(['category:id,name,slug', 'subcategory:id,name,slug', 'brand:id,name']);
    }

    private function pickerItem(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'active' => (bool) $product->active,
            'image' => $product->image_thumbs_webp_url ?: $product->image_url,
            'category' => $product->category?->name,
            'brand' => $product->brand?->name,
        ];
    }
}
