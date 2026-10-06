<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Mail;
use App\Traits\WebTrait;
use App\Traits\ShopTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\Product;
use App\Mail\MessageReceived;

class WebController extends Controller{
    use WebTrait;
    use ShopTrait;

    public function homepage(){  

        $sections = $this->webContent()->homeSections();
        $types = array_column($sections, 'type');

        // Solo se cargan los datos de las secciones que están visibles
        return Inertia::render('web/HomePage', [
            'sections' => $sections,
            'banners' => in_array('hero', $types, true) ? $this->get_banners('1') : [],
            'categorias' => in_array('categories', $types, true) ? $this->get_categories_home() : [],
            'brands' => in_array('brands', $types, true) ? $this->get_marcas() : [],
        ]);
    }

    public function about(){        
        return Inertia::render('web/AboutPage', [
            'about' => $this->webContent()->aboutContent(),
        ]);
    }

    public function cart(){
        return Inertia::render('web/CarritoPage');
    }

    public function products(Request $request){
        $rawCs = $request->cs;
        $categories = is_array($rawCs) ? $rawCs : ($request->filled('cs') ? explode(',', (string) $rawCs) : []);
        $categories = array_values(array_unique(array_filter(array_map('intval', $categories))));

        $activeCategory = null;
        if ($request->category) {
            $category = $this->get_category_slug($request->category);
            if ($category) {
                $activeCategory = $category;
                if (empty($categories)) {
                    $categories = [$category->id];
                }
            }
        }
        
        $subcategory_id = null;
        $activeSubcategory = null;
        if ($request->subcategory) {
            $subcategory = $this->get_subcategory_slug($request->subcategory, $request->category);
            if ($subcategory) {
                $subcategory_id = $subcategory->id;
                $activeSubcategory = $subcategory;
            }
        } elseif ($request->filled('subcategory_id')) {
            $subcategory_id = (int) $request->subcategory_id;
            $activeSubcategory = \App\Models\Subcategory::find($subcategory_id);
        }
        
        $rawMs = $request->ms;
        $brands = is_array($rawMs) ? $rawMs : ($request->filled('ms') ? explode(',', (string) $rawMs) : []);
        $brands = array_values(array_unique(array_filter(array_map('intval', $brands))));

        if ($request->brand && empty($brands)) {
            $brandModel = is_numeric($request->brand) ? \App\Models\Brand::find($request->brand) : \App\Models\Brand::where('name', $request->brand)->first();
            if ($brandModel) {
                $brands = [$brandModel->id];
            } elseif (is_numeric($request->brand)) {
                $brands = [(int) $request->brand];
            }
        }
        
        $rawSs = $request->ss;
        $subcategories = is_array($rawSs) ? $rawSs : ($request->filled('ss') ? explode(',', (string) $rawSs) : []);
        $subcategories = array_values(array_unique(array_filter(array_map('intval', $subcategories))));

        $offers = $request->boolean('offers');
        $sort = in_array($request->sort, ['off', 'asc', 'desc'], true) ? $request->sort : 'rel';

        $find = $request->filled('find') ? trim((string) $request->find) : null;
        $products = $this->webContent()->products($categories, $subcategory_id, $brands, $find, $subcategories, $offers, $sort);

        return Inertia::render('web/ProductosPage', [
            'categorias' => $this->get_categories_home(),
            'categories' => $this->webContent()->categoryTree(),
            'products' => $products,
            'brands' => $this->get_marcas(),
            'cates' => $categories,
            'subs' => $subcategories,
            'marcas' => $brands,
            'offers' => $offers,
            'sort' => $sort,
            'find' => $find ?? '',
            'activeCategory' => $activeCategory,
            'activeSubcategory' => $activeSubcategory,
        ]);
    }

    public function product(Request $request){   
        $product = $this->get_product($request->product, $request->category, ($request->subcategory=='All'?NULL:$request->subcategory));        
        
        abort_unless($product, 404);

        // Relacionados: primero de la misma categoria y, si faltan, se completa con otros productos.
        $related = Product::with(['inventory', 'category', 'subcategory', 'brand'])->where('active', true)->where('id', '!=', $product->id)->where('category_id', $product->category_id)->limit(4)->get();
        if ($related->count() < 4) {
            $related = $related->concat(
                Product::with(['inventory', 'category', 'subcategory', 'brand'])->where('active', true)->where('id', '!=', $product->id)->where('category_id', '!=', $product->category_id)->limit(4 - $related->count())->get()
            );
        }

        return Inertia::render('web/ProductDetailPage', [
            'product' => $product,
            'products' => $related->values(),
        ]);
    }

    public function storefind(Request $request){
        return $this->products($request);
    }

    public function services(){
        return redirect()->route('contact');
    }

    public function contact(){
        return Inertia::render('web/ContactoPage');
    }

    public function store(Request $request){
        
        $message = $request->validate([
            'name' => 'required|max:100',
            'phone' => 'required|max:100',
            'company' => 'nullable|max:100',
            'email' => 'required|email|max:200',
            'message' => 'nullable',
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'phone.required' => 'El teléfono es obligatorio.',
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'El email no es válido.',
        ]);
        Mail::to(\App\Models\ContactSetting::value('form_recipient') ?: config('contact.email'))->send(new MessageReceived($message));

        return redirect()->route('contact')->with('status', 'El mensaje fue enviado exitosamente.');
        
    }
    
}
