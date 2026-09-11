<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

use App\Traits\PostTrait;
use Inertia\Inertia;

class CategoryController extends Controller
{
    use PostTrait;
    public function __construct()
    {
        // Configurar campos de búsqueda
        $this->configureSearchable(['name', 'summary']);
        // Configurar campos ordenables
        $this->configureSortable(['name', 'created_at'], 'order', 'asc');
        // Configurar paginación
        $this->configurePagination(20);
        // Configurar relaciones
        $this->configureRelations([]);
        // Configurar imágenes
        $this->configureImages(['image'], config('variables.folder_category'), 900, NULL, true, 300, NULL);        
        // Configurar accessors
        $this->configureAppends(['image_url']);
    }

    public function index(Request $request){
        return $this->indexWithFilters($request, Category::class, 'admin/categories/Index', []);
    }
    
    public function create(){
        return Inertia::render('admin/categories/Create', [
            'category' => new Category
        ]);
    }

    public function store(CategoryRequest $request){

        $this->createRecord($request, new Category());
        return redirect()->route('categories.index')->with('success', 'Categoria creada exitosamente.');
        
    }

    public function show(Category $category){

        return Inertia::render('admin/categories/show', [
            'category' => $category->append(['image_url']),
        ]);

    }

 
    public function edit(Category $category){
        
        return Inertia::render('admin/categories/Edit', [
            'category' => $category->append(['image_url'])
        ]);

    }
    
    public function update(CategoryRequest $request, Category $category){
        
        $this->updateRecord($request, $category);
        return redirect()->route('categories.index')->with('success', 'Categoría actualizada exitosamente.');

    }
 
    public function destroy(Category $category){

        $this->destroyRecord($category);
        return redirect()->route('categories.index')->with('success', 'Categoría eliminada exitosamente.');

    }

    public function togglePublish(Category $category){

        $category->update(['active' => !$category->active]);
        return redirect()->route('categories.index');

    }
    
    public function reorder(Request $request){
        
        $validated = $request->validate([
            'categories' => ['required', 'array'],
            'categories.*' => ['required', 'integer', 'exists:categories,id'],
        ]);

        foreach ($validated['categories'] as $index => $categoryId) {
            Category::where('id', $categoryId)->update(['order' => $index + 1]);
        }        

        return redirect()->route('categories.index')->with('success', 'Se ordeno de manera correcta.');
    }

}

