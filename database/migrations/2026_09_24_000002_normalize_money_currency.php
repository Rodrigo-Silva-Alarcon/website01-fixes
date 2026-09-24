<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('inventories')->where('money', 'Bo')->update(['money' => 'Bs.']);
        DB::table('cart_items')->where('money', 'Bo')->update(['money' => 'Bs.']);

        Schema::table('inventories', function (Blueprint $table) {
            $table->string('money')->default('Bs.')->change();
        });
        Schema::table('cart_items', function (Blueprint $table) {
            $table->string('money')->default('Bs.')->change();
        });
    }

    public function down(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->string('money')->default('Bo')->change();
        });
        Schema::table('cart_items', function (Blueprint $table) {
            $table->string('money')->default('Bo')->change();
        });
    }
};
