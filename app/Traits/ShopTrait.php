<?php

namespace App\Traits;

use Illuminate\Support\Facades\Hash;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Imagick\Driver;
use Illuminate\Support\Str;

use App\Models\Product;
use App\Models\Cart;
use App\Models\CartItem;
trait ShopTrait {
    
    function get_shop_cart(){        
        return Cart::with(['cartItems'])->where('cart_session', session('shop'))->first();        
    }    
}

?>