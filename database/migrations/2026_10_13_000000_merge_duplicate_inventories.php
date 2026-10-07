<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Un producto tiene un único inventario (un precio y un stock). Si hay duplicados
     * se conserva el registro más antiguo con su precio y se le suma el stock del resto.
     */
    public function up(): void
    {
        $duplicated = DB::table('inventories')
            ->select('product_id')
            ->groupBy('product_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('product_id');

        foreach ($duplicated as $productId) {
            $rows = DB::table('inventories')->where('product_id', $productId)->orderBy('id')->get();
            $keep = $rows->first();

            DB::table('inventories')->where('id', $keep->id)->update([
                'stock' => $rows->sum(fn ($row) => (int) ($row->stock ?? 0)),
                'updated_at' => now(),
            ]);
            DB::table('inventories')->where('product_id', $productId)->where('id', '!=', $keep->id)->delete();
        }

        Schema::table('inventories', function (Blueprint $table) {
            $table->unique('product_id');
        });
    }

    public function down(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->dropUnique(['product_id']);
        });
    }
};
