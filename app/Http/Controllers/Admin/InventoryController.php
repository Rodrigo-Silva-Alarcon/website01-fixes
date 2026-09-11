<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\InventoryRequest;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Traits\PostTrait;
use Inertia\Inertia;

class InventoryController extends Controller
{
    use PostTrait;
    public function __construct(){
        // Configurar campos de búsqueda
        $this->configureSearchable(['amount', 'stock', 'money']);
        // Configurar campos ordenables
        $this->configureSortable(['amount', 'stock', 'created_at'], 'created_at', 'desc');
        // Configurar paginación
        $this->configurePagination(20);
        // Configurar relaciones
        $this->configureRelations(['product']);
        // Configurar imágenes (ninguna para inventories)
        $this->configureImages([], 'inventories', 800, 600, true, 90, 80);
        // Configurar accessors (ninguno por ahora)
        $this->configureAppends([]);
    }
    public function index(Request $request){
        return $this->indexWithFilters($request, Inventory::class, 'admin/inventories/Index', []);
    }
    public function create(){

        $inventory = new Inventory;
        return Inertia::render('admin/inventories/Create' ,[
            'inventory' => $inventory,
            'products' => Product::where('active', true)->whereDoesntHave('inventory')->orderBy('name')->pluck('name', 'id')->toArray()
        ]);
    }

    public function store(InventoryRequest $request){
        $this->createRecord($request, new Inventory());
        return redirect()->route('inventories.index')->with('success', 'Inventario creado exitosamente.');
    }

    public function store_product(InventoryRequest $request){
        $this->createRecord($request, new Inventory());
        return redirect()->back()->with('success', 'Inventario creado exitosamente.');
    }



    public function show(Inventory $inventory){
        return Inertia::render('admin/inventories/show', [
            'inventory' => $inventory->load('product'),
        ]);
    }

    public function edit(Inventory $inventory){
        return Inertia::render('admin/inventories/Edit', [
            'inventory' => $inventory->load('product'),
            'products' => Product::where('active', true)->where('id', $inventory->product_id)->orderBy('name')->pluck('name', 'id')->toArray()
        ]);
    }

    public function update(InventoryRequest $request, Inventory $inventory){

        $this->updateRecord($request, $inventory);
        return redirect()->route('products.edit', $inventory->product_id )->with('success', 'Inventario actualizado exitosamente.');
    }

    public function destroy(Inventory $inventory){
        $this->destroyRecord($inventory);
        return redirect()->route('inventories.index')->with('success', 'Inventario eliminado exitosamente.');
    }

    public function destroy_product(Inventory $inventory){
        $this->destroyRecord($inventory);
        return redirect()->back()->with('success', 'Inventario eliminado exitosamente.');
    }
}





