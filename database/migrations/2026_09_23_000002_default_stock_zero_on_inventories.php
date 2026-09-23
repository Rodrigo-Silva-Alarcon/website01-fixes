<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('inventories')->whereNull('stock')->update(['stock' => 0]);

        Schema::table('inventories', function (Blueprint $table) {
            $table->integer('stock')->default(0)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->integer('stock')->nullable()->change();
        });
    }
};
