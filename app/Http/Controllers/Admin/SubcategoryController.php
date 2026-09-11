<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubcategoryRequest;
use App\Models\Subcategory;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Traits\PostTrait;
use Inertia\Inertia;

class SubcategoryController extends Controller
{
    use PostTrait;
    public function __construct(){
        // Configurar campos de búsqueda
        $this->configureSearchable(['name', 'summary']);
        // Configurar campos ordenables
        $this->configureSortable(['name', 'created_at'], 'order', 'asc');
        // Configurar paginación
        $this->configurePagination(20);
        // Configurar relaciones
        $this->configureRelations([]);
        // Configurar imágenes
        $this->configureImages(['image', 'tecnical_image'], 'subcategories', 800, 600, true, 90, 80);        
        // Configurar accessors
        $this->configureAppends(['category_label']);
    }
    public function index(Request $request){
        $categories = Category::with(['subcategories' => function($query){
            $query->orderBy('order', 'ASC');
        }])->orderBy('order', 'ASC')->orderBy('id', 'DESC')->get();
        return $this->indexWithFilters($request, Subcategory::class, 'admin/subcategories/Index', ['categories' => $categories]);
    }
    public function create(){
        
        $subcategory = new Subcategory;        
        return Inertia::render('admin/subcategories/Create' ,[            
            'subcategory' => $subcategory,
            'categories' => Category::orderBy('order', 'ASC')->pluck('name', 'id')->toArray()
        ]);
    }

    public function store(SubcategoryRequest $request){
        $this->createRecord($request, new Subcategory());
        return redirect()->route('subcategories.index')->with('success', 'Subcategoría creada exitosamente.');
    }

    
    public function show(Subcategory $subcategory){
        return Inertia::render('admin/subcategories/show', [
            'subcategory' => $subcategory->append(['category_label']),
        ]);
    }   

    public function edit(Subcategory $subcategory){
        return Inertia::render('admin/subcategories/Edit', [
            'subcategory' => $subcategory->append(['category_label']),
            'categories' => Category::orderBy('order', 'ASC')->pluck('name', 'id')->toArray()
        ]);
    }

    public function update(SubcategoryRequest $request, Subcategory $subcategory){
        
        $this->updateRecord($request, $subcategory);
        return redirect()->route('subcategories.index')->with('success', 'Subcategoría actualizada exitosamente.');
    }

    public function destroy(Subcategory $subcategory){
        
        $this->destroyRecord($subcategory);

        return redirect()->route('subcategories.index')->with('success', 'Subcategoría eliminada exitosamente.');
    }

    public function togglePublish(Subcategory $subcategory){
        $subcategory->update(['active' => !$subcategory->active]);
        return redirect()->route('subcategories.index');
    }

    public function reorder(Request $request){
        
        $validated = $request->validate([
            'subcategories' => ['required', 'array'],
            'subcategories.*' => ['required', 'integer', 'exists:subcategories,id'],
        ]);

        foreach ($validated['subcategories'] as $index => $Id) {
            Category::where('id', $Id)->update(['order' => $index + 1]);
        }        

        return redirect()->route('subcategories.index')->with('success', 'Se ordeno de manera correcta.');
    }
}
