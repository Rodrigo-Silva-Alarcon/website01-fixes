<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BannerRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

use App\Models\Banner;
use App\Models\Product;
use App\Models\Category;
use App\Traits\PostTrait;
use Inertia\Inertia;


class BannerController extends Controller
{
    use PostTrait;

    public function __construct()
    {
        // Configurar campos de búsqueda
        $this->configureSearchable(['name', 'summary']);
        // Configurar campos ordenables
        $this->configureSortable(['name', 'created_at'], 'name', 'asc');
        // Configurar paginación
        $this->configurePagination(20);
        // Configurar relaciones
        $this->configureRelations([]);
        // Configurar imágenes
        $this->configureImages(['image', 'tecnical_image'], config('variables.folder_banner'), 1600, NULL, true, 300, NULL);
        // configuracion de los archivos
        $this->configureFiles(['video_file'], 'videos');
        // Configurar accessors        
        $this->configureAppends(['image_url', 'image_thumbs_url']);
    }

    public function index(Request $request){
        return $this->indexWithFilters($request, Banner::class, 'admin/banners/Index', []);
    }

    
    public function create(){                
        $categories = Category::with(['products' => function ($query) {
            $query->where('active', true);
        }])->where('active', true)->orderBy('order', 'ASC')->orderBy('id', 'DESC')->get();
        
        return Inertia::render('admin/banners/Create', [
            'banner' => new Banner,            
            'categories' => $categories
        ]);
    }

    public function store(BannerRequest $request){

        $this->createRecord($request, new Banner());
        return redirect()->route('banners.index')->with('success', 'Producto creado exitosamente.');
        
    }

    public function show(Banner $banner){

        return Inertia::render('admin/banners/show', [
            'banner' => $banner,
        ]);

    }
 
    public function edit(Banner $banner){
        $categories = Category::with(['products' => function($query){
            $query->where('active', true);
        }])->where('active', true)->orderBy('order', 'ASC')->orderBy('id', 'DESC')->get();

        return Inertia::render('admin/banners/Edit', [
            'banner' => $banner,
            'categories' => $categories
        ]);

    }
    
    public function update(BannerRequest $request, Banner $banner){
        
        $this->updateRecord($request, $banner);
        return redirect()->route('banners.index')->with('success', 'Baner actualizado exitosamente.');

    }
 
    public function destroy(Banner $banner){

        $this->destroyRecord($banner);
        return redirect()->route('banners.index')->with('success', 'Bamer eliminado exitosamente.');

    }

    public function togglePublish(Banner $banner){

        $banner->update(['active' => !$banner->active]);
        return redirect()->route('banners.index');

    }
    
    public function reorder(Request $request){
        
        $validated = $request->validate([
            'banners' => ['required', 'array'],
            'banners.*' => ['required', 'integer', 'exists:banners,id'],
        ]);

        foreach ($validated['banners'] as $index => $bannerId) {
            Banner::where('id', $bannerId)->update(['order' => $index + 1]);
        }        

        return redirect()->route('banners.index')->with('success', 'Se ordeno de manera correcta.');
    }

}