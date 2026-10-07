<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Las categorías antiguas "Televisores" y "Celulares" pasaron a ser subcategorías
     * (Entretenimiento > Smart TV / Televisor Oled y Dispositivos portatiles > Smartphone).
     * Se mueven sus productos y subcategorías y luego se eliminan.
     */
    public function up(): void
    {
        $this->retire('Televisores', 'Entretenimiento', 'Smart TV', ['oled' => 'Televisor Oled']);
        $this->retire('Celulares', 'Dispositivos portatiles', 'Smartphone');
    }

    public function down(): void
    {
        // Sin vuelta atrás: los productos ya quedan en su subcategoría nueva.
    }

    /**
     * @param  array<string, string>  $byKeyword  palabra en el nombre del producto => subcategoría
     */
    private function retire(string $oldName, string $newCategoryName, string $defaultSub, array $byKeyword = []): void
    {
        $old = DB::table('categories')->where('name', $oldName)->first();
        if (! $old) {
            return;
        }

        $new = DB::table('categories')->where('name', $newCategoryName)->first();
        $subId = fn (string $name) => $new
            ? DB::table('subcategories')->where('category_id', $new->id)->where('name', $name)->value('id')
            : null;

        $products = DB::table('products')->where('category_id', $old->id)->get(['id', 'name']);
        if ($products->isNotEmpty() && (! $new || ! $subId($defaultSub))) {
            throw new RuntimeException("No existe {$newCategoryName} > {$defaultSub}; no se pueden mover los productos de {$oldName}.");
        }

        foreach ($products as $product) {
            $target = $defaultSub;
            foreach ($byKeyword as $keyword => $subName) {
                if (str_contains(mb_strtolower($product->name), $keyword) && $subId($subName)) {
                    $target = $subName;
                }
            }
            DB::table('products')->where('id', $product->id)->update([
                'category_id' => $new->id,
                'subcategory_id' => $subId($target),
                'updated_at' => now(),
            ]);
        }

        // Subcategorías que aún cuelguen de la categoría antigua pasan a la nueva.
        if ($new) {
            DB::table('subcategories')->where('category_id', $old->id)->update(['category_id' => $new->id]);
        }

        DB::table('categories')->where('id', $old->id)->delete();
    }
};
