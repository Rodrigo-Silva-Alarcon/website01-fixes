<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    if (!Schema::hasColumn('categories', 'image')) {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('image', 250)->nullable()->after('summary');
        });
    }
    if (!Schema::hasColumn('subcategories', 'image')) {
        Schema::table('subcategories', function (Blueprint $table) {
            $table->string('image', 250)->nullable()->after('summary');
        });
    }
    // normalize any double-prefixed paths written before model convention was fixed
    foreach (['categories', 'subcategories'] as $tbl) {
        \DB::table($tbl)->where('image', 'like', '%data/categories/%')->update([
            'image' => \DB::raw("substr(image, length('data/categories/') + 1)"),
        ]);
    }
}

    public function down(): void
    {
        if (Schema::hasColumn('categories', 'image')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->dropColumn('image');
            });
        }
        if (Schema::hasColumn('subcategories', 'image')) {
            Schema::table('subcategories', function (Blueprint $table) {
                $table->dropColumn('image');
            });
        }
    }
};
