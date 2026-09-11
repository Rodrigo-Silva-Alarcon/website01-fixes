<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

use App\Traits\PostTrait;
use Inertia\Inertia;

use App\Models\Banner;
use App\Models\Subcategory;
use App\Models\Category;
use App\Models\Product;

class DashboardController extends Controller
{
    use PostTrait;

    public function dashboard(){
        return Inertia::render('admin/dashboard', [
            'products' => Product::count(),
            'categories' => Category::count(),
            'subcategorieds' => Subcategory::count(),
            'banners' => Banner::count()
        ]);
        /* return Inertia::render('admin/dashboard'); */
    }

}

