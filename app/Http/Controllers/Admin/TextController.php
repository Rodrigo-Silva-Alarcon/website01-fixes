<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Text;
use App\Http\Requests\SaveTextRequest;
use App\Traits\PostTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TextController extends Controller
{
    use PostTrait;

    public function __construct()
    {
        // Configurar campos de búsqueda
        $this->configureSearchable(['name', 'summary']);
        // Configurar campos ordenables
        $this->configureSortable(['name', 'date', 'created_at'], 'name', 'asc');
        // Configurar paginación
        $this->configurePagination(20);
        // Configurar relaciones
        $this->configureRelations([]);
        // Configurar imágenes
        $this->configureImages(['image'], 'texts', 800, 600, true, 90, 80);
        // Configurar accessors
        $this->configureAppends(['image_url', 'gender_label', 'print_view_label', 'type_labels']);
    }

    public function index(Request $request)
    {
        return $this->indexWithFilters($request, Text::class, 'admin/texts/Index', []);
    }

    public function create()
    {
        return Inertia::render('admin/texts/Create', [
            'text' => new Text,
        ]);
    }

    public function store(SaveTextRequest $request)
    {
        $this->createRecord($request, new Text());

        return redirect()->route('admin.texts.index')
            ->with('success', 'Texto creado exitosamente.');
    }

    public function show(Text $text)
    {
        return Inertia::render('admin/texts/Show', [
            'text' => $text->append(['image_url', 'gender_label', 'print_view_label', 'type_labels']),
        ]);
    }

    public function edit(Text $text)
    {
        return Inertia::render('admin/texts/Edit', [
            'text' => $text->append(['image_url', 'gender_label', 'print_view_label', 'type_labels']),
        ]);
    }

    public function update(SaveTextRequest $request, Text $text)
    {
        $this->updateRecord($request, $text);

        return redirect()->route('admin.texts.index')
            ->with('success', 'Texto actualizado exitosamente.');
    }

    public function destroy(Text $text)
    {
        $this->destroyRecord($text);

        return redirect()->route('admin.texts.index')
            ->with('success', 'Texto eliminado exitosamente.');
    }

    public function togglePublish(Text $text)
    {
        $text->update(['publish' => !$text->publish]);

        return redirect()->route('admin.texts.index');
    }

}
