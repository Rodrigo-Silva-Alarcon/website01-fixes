<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\Brand;
use App\Traits\PostTrait;
use Inertia\Inertia;


class ProductController extends Controller
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
        $this->configureRelations(['images']);
        // Configurar imágenes
        $this->configureImages(['image', 'tecnical_image'], config('variables.folder_product'), 800, NULL, true, 90, NULL);
        // configuracion de los archivos
        $this->configureFiles(['video_file'], 'videos');
        // Configurar accessors        
        $this->configureAppends(['image_url', 'tecnical_image_url', 'video_file_url']);
    }

    public function index(Request $request){
        $categories = Category::with(['subcategories' => function($query){
            $query->orderBy('order', 'ASC');
        }])->orderBy('order', 'ASC')->orderBy('id', 'DESC')->get();
        return $this->indexWithFilters($request, Product::class, 'admin/products/Index', ['categories' => $categories]);
    }

    
    public function create(){        
        $categories = Category::with(['subcategories'])->orderBy('order', 'ASC')->orderBy('id', 'DESC')->get();
        $brands = Brand::where('active', true)->orderBy('order', 'ASC')->orderBy('id', 'DESC')->get();
        return Inertia::render('admin/products/Create', [
            'product' => new Product,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    public function store(ProductRequest $request){

        $product = $this->createRecord($request, new Product());
        return redirect()->route('products.edit', $product->id)->with('success', 'Producto creado exitosamente.');
        
    }

    public function show(Product $product){

        return Inertia::render('admin/products/show', [
            'product' => $product->append(['image_url', 'tecnical_image_url', 'video_file_url']),
        ]);

    }
 
    public function edit(Product $product){

        $product->load(['images', 'inventories'])->append(['image_url', 'tecnical_image_url', 'video_file_url']);
        $product->images->each->append('image_url');
        $brands = Brand::where('active', true)->orderBy('order', 'ASC')->orderBy('id', 'DESC')->get();

        $categories = Category::with(['subcategories'])->orderBy('order', 'ASC')->orderBy('id', 'DESC')->get();
        return Inertia::render('admin/products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'brands' => $brands,
        ]);

    }
    
    public function update(ProductRequest $request, Product $product){
        
        $this->updateRecord($request, $product);
        return redirect()->route('products.index')->with('success', 'Categoría actualizada exitosamente.');

    }
 
    public function destroy(Product $product){

        $this->destroyRecord($product);
        return redirect()->route('products.index')->with('success', 'Categoría eliminada exitosamente.');

    }

    public function togglePublish(Product $product){

        $product->update(['active' => !$product->active]);
        return redirect()->route('products.index');

    }
    
    public function reorder(Request $request){
        
        $validated = $request->validate([
            'products' => ['required', 'array'],
            'products.*' => ['required', 'integer', 'exists:products,id'],
        ]);

        foreach ($validated['products'] as $index => $productId) {
            Product::where('id', $productId)->update(['order' => $index + 1]);
        }        

        return redirect()->route('products.index')->with('success', 'Se ordeno de manera correcta.');
    }

}





