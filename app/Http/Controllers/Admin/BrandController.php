<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BrandRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

use App\Models\Brand;
use App\Traits\PostTrait;
use Inertia\Inertia;

class BrandController extends Controller
{
    use PostTrait;

    public function __construct()
    {
        // Configurar campos de búsqueda
        $this->configureSearchable(['name']);
        // Configurar campos ordenables
        $this->configureSortable(['name', 'created_at'], 'order', 'asc');
        // Configurar paginación
        $this->configurePagination(20);
        // Configurar relaciones
        $this->configureRelations([]);
        // Configurar imágenes
        $this->configureImages(['image'], config('variables.folder_banner'), 800, NULL, true, 300, NULL);
        // configuracion de los archivos
        //$this->configureFiles(['video_file'], 'videos');
        // Configurar accessors        
        $this->configureAppends(['image_url', 'image_url_thumbs']);
    }

    public function index(Request $request){
        return $this->indexWithFilters($request, Brand::class, 'admin/brands/Index', []);
    }
    
    public function create(){                
        return Inertia::render('admin/brands/Create', [
            'brand' => new Brand
        ]);
    }

    public function store(BrandRequest $request){

        $this->createRecord($request, new Brand());
        return redirect()->route('brands.index')->with('success', 'Producto creado exitosamente.');
        
    }

    public function show(Brand $brand){
        return Inertia::render('admin/brands/show', [
            'brand' => $brand->append(['image_url', 'image_url_thumbs']),
        ]);
    }
 
    public function edit(Brand $brand){

        return Inertia::render('admin/brands/Edit', [
            'brand' => $brand->append(['image_url', 'image_url_thumbs'])
        ]);

    }
    
    public function update(BrandRequest $request, Brand $brand){
        
        $this->updateRecord($request, $brand);
        return redirect()->route('brands.index')->with('success', 'Baner actualizado exitosamente.');

    }
 
    public function destroy(Brand $brand){

        $this->destroyRecord($brand);
        return redirect()->route('brands.index')->with('success', 'Bamer eliminado exitosamente.');

    }

    public function togglePublish(Brand $brand){

        $brand->update(['active' => !$brand->active]);
        return redirect()->route('brands.index');

    }
    
    public function reorder(Request $request){
        
        $validated = $request->validate([
            'brands' => ['required', 'array'],
            'brands.*' => ['required', 'integer', 'exists:products,id'],
        ]);

        foreach ($validated['products'] as $index => $brandId) {
            Brand::where('id', $brandId)->update(['order' => $index + 1]);
        }        

        return redirect()->route('brands.index')->with('success', 'Se ordeno de manera correcta.');
    }

}