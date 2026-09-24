<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $duplicates = DB::table('carts')
            ->select('cart_session')
            ->groupBy('cart_session')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('cart_session');

        foreach ($duplicates as $session) {
            $keepId = DB::table('cart_items')
                ->whereIn('cart_id', DB::table('carts')->where('cart_session', $session)->select('id'))
                ->join('carts', 'carts.id', '=', 'cart_items.cart_id')
                ->orderByDesc('carts.id')
                ->value('carts.id');

            if ($keepId === null) {
                $keepId = DB::table('carts')
                    ->where('cart_session', $session)
                    ->orderByDesc('id')
                    ->value('id');
            }

            DB::table('carts')
                ->where('cart_session', $session)
                ->where('id', '!=', $keepId)
                ->delete();
        }

        Schema::table('carts', function (Blueprint $table) {
            $table->unique('cart_session');
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropUnique(['cart_session']);
        });
    }
};
