<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Mail;
use App\Traits\WebTrail;
use App\Traits\ShopTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\Product;
use App\Mail\MessageReceived;

class WebController extends Controller{
    use WebTrail;
    use ShopTrait;

    public function homepage(){  

        return Inertia::render('web/HomePage', [
            'banners' => $this->get_banners('1'),
            'populares' => $this->get_populares(),
            'categorias' => $this->get_categories_home(),
            'categories' => $this->get_categories_home_all(),
            'destacados' => $this->get_detacados(),
            'marcas' => $this->get_marcas(),
        ]);
    }

    public function about(){        
        return Inertia::render('web/AboutPage');
    }

    public function products(Request $request){
        $cateories = $request->cs??[];

        if($request->category){
            $category = $this->get_category_slug($request->category);
            if($category){
                $cateories = [$category->id];
            }
        }
        
        $subcategory_id = NULL;
        if($request->subcategory){
            $subcategory = $this->get_subcategory_slug($request->subcategory, $request->category);
            if($subcategory){
                $subcategory_id = $subcategory->id;
            }
        }
        
        $brands = $request->ms??[];
        if($request->brand){
            $brands = [$request->brand];
        }
        
        $products = $this->get_products($cateories, $subcategory_id,  $brands, $request->find);
        
        $category_id = $request->category;
        $subcategory_id = $request->subcategory;
        

        return Inertia::render('web/ProductosPage', [
            'categorias' => $this->get_categories_home(),
            'categories' => $this->get_categories_home_all(),
            'products' => $products,
            'brands' => $this->get_marcas(),
        ]);
    }

    public function product(Request $request){   
        $product = $this->get_product($request->product, $request->category, ($request->subcategory=='All'?NULL:$request->subcategory));        
        
        abort_unless($product, 404);

        return Inertia::render('web/ProductDetailPage', [
            'product' => $product,
            'products' => Product::where('active', true)->where('id', '!=', $product->id)->where('category_id', $product->category_id)->limit(4)->get()
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
            //'g-recaptcha-response' => ['required', new ValidRecaptcha],
            //'g-recaptcha-response' => ['required', 'string', new ValidRecaptcha3],
        ],
        //['g-recaptcha-response.required' => 'Verifique que no es un robot con ReCaptcha',]
        ); 
        Mail::to('mjuchani@megalink.com')->send(new MessageReceived($message));     
 
        return redirect()->route('contact')->with('status', 'El mensaje fue enviado exitosamente.');
        
    }
    
}
