<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImageRequest;
use App\Models\Image;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageController extends Controller
{     
    public function index(){
        
    }

    public function create(){
        
    }
    public function store(Product $product, ImageRequest $request)
    {
        try {
            $file = $request->file('image');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $publicPath = 'data/images/';
            $fullPath = public_path($publicPath);

            // Crear directorio si no existe
            if (!File::exists($fullPath)) {
                File::makeDirectory($fullPath, 0755, true);
            }

            $filePath = $fullPath . $filename;

            // Crear manager de imagen
            $manager = new ImageManager(new Driver());

            // Verificar que sea imagen válida
            $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            if (!in_array($file->getMimeType(), $allowedMimes)) {
                return response()->json(['error' => 'Tipo de imagen no válido'], 422);
            }

            // Redimensionar imagen principal (800x600)
            $image = $manager->read($file);
            $image->scale(800, 600);

            // Guardar imagen
            $image->save($filePath);

            // Crear thumbnail
            $thumbPath = $fullPath . 'thumbs/';
            if (!File::exists($thumbPath)) {
                File::makeDirectory($thumbPath, 0755, true);
            }

            $thumbnail = $manager->read($file);
            $thumbnail->scale(200, 150);
            $thumbnail->save($thumbPath . $filename);

            // Crear registro en base de datos
            $product->images()->create([
                'name' => $filename,
                'original_name' => $file->getClientOriginalName(),
                'order' => $request->order ?? 0,
            ]);

            // que envie todas las imagenes
             
            return response()->json([
                'success' => true,
                'image' => $file->getClientOriginalName(),
                'image_url' => asset($publicPath . $filename),
                'image_thumb_url' => asset($publicPath . 'thumbs/' . $filename),
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al procesar la imagen: ' . $e->getMessage()], 500);
        }
    }

    public function show(Image $image): View{
        
    }
    
    public function edit(Image $image): View{
        
    }
    
    public function update(ImageRequest $request, Image $image){
        
    }

    public function destroy(Image $image){
        // Eliminar archivos físicos
        if ($image->name) {
            $fullPath = public_path($image->name);
            if (File::exists($fullPath)) {
                File::delete($fullPath);
            }

            // Eliminar thumbnail si existe
            $thumbPath = str_replace('/' . basename($image->name), '/thumbs/' . basename($image->name), $fullPath);
            if (File::exists($thumbPath)) {
                File::delete($thumbPath);
            }
        }

        // Eliminar registro de base de datos
        $image->delete();

        return response()->json([
                'success' => true,
            ]);
    }
}





