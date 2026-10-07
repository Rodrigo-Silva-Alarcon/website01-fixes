<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Mail;
use App\Traits\WebTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Mail\MessageReceived;
use App\Models\Product;
use App\Models\Cart;
use App\Models\CartItem;

use Illuminate\Support\Facades\DB;

class ShopController extends Controller{
    use WebTrait;

    public function add(Request $request){
        
        $product = Product::with('inventory')->where('active', true)->whereHas('inventory')->where('id', $request->product)->firstOrFail();
        // Precio vigente (oferta incluida) con la misma regla que muestra la tienda.
        $price = $product->inventory->currentPrice();
        
        $array = array();
        $car_id = NULL;

        if($product->id){
            // Cantidad opcional (selector del detalle de producto); por defecto 1.
            $qty = max(1, min(99, (int) $request->input('amount', 1)));

            $added = DB::transaction(function () use ($product, $qty, $price) {
                $car_id = NULL;

                if(session()->has('shop')){
                    $cart = Cart::where('cart_session', session('shop'))->lockForUpdate()->first();
                    if($cart){
                        $car_id = $cart->id;
                    }
                }

                if($car_id == NULL){
                    if(!session()->has('shop')){
                        session()->put('shop', md5(uniqid((string) mt_rand(), true)));
                    }
                    $card = Cart::firstOrCreate([
                        'cart_session' => session('shop'),
                    ], [
                        'user_id' => auth()->id(),
                    ]);
                    $car_id = $card->id;
                }

                $cart = CartItem::where('cart_id', $car_id)->where('product_id', $product->id)->lockForUpdate()->first();
                $stock = (int) ($product->inventory->stock ?? 0);
                $nextAmount = $cart ? $cart->amount + $qty : $qty;

                if ($stock < $nextAmount) {
                    return false;
                }

                if ($cart){
                    $amount = $nextAmount;
                    CartItem::where('id', $cart->id)->update([
                        'amount' => $amount,
                        'unit_price' => $price,
                        'sub_total' => $amount * $price,
                    ]);
                }
                else{
                    CartItem::create([
                        'cart_id' => $car_id,
                        'product_id' => $product->id,
                        'name' => $product->name,
                        'image' => $product->image,
                        'unit_price' => $price,
                        'amount' => $qty,
                        'money' => $product->inventory->money,
                        'sub_total' => $qty * $price,
                    ]);
                }

                return true;
            });

            if (!$added) {
                return redirect()->back()->with('status', 'No hay stock suficiente para ese producto.');
            }
        }

        return redirect()->back()->with('status', 'El producto se agrego correctamente al carrito.');

    }
    public function update(Request $request){
        $data = $request->validate(['amount' => 'required|integer|min:1|max:9999']);
        abort_unless(session()->has('shop'), 404);
        $cart = Cart::where('cart_session', session('shop'))->firstOrFail();
        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $request->route('product'))->firstOrFail();

        $inventory = \App\Models\Inventory::where('product_id', $item->product_id)->first();
        if ($inventory !== null && (int) $inventory->stock < $data['amount']) {
            return redirect()->back()->with('status', 'No hay stock suficiente para esa cantidad.');
        }

        $item->update([
            'amount' => $data['amount'],
            'sub_total' => (int) round((float) $item->unit_price * 100) * $data['amount'] / 100,
        ]);

        return redirect()->back();
    }

    public function remove(Request $request){
        if(session()->has('shop')){                
            $cart = Cart::where('cart_session', session('shop'))->first();
            if($cart){
                CartItem::where('cart_id', $cart->id)->where('product_id', $request->product)->delete(); 
            }
        }
        return redirect()->back()->with('status', 'El producto se elimino correctamente del carrito.');
    }

    public function clear(){
        if(session()->has('shop')){
            $cart = Cart::where('cart_session', session('shop'))->first();
            if($cart){
                CartItem::where('cart_id', $cart->id)->delete();
            }
        }
        return redirect()->back()->with('status', 'Se vació el carrito.');
    }

        
}
