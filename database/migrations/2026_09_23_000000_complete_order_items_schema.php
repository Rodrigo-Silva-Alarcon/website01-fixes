<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'order_id')) {
                $table->integer('order_id');
            }
            if (!Schema::hasColumn('order_items', 'product_id')) {
                $table->integer('product_id')->nullable();
            }
            if (!Schema::hasColumn('order_items', 'name')) {
                $table->string('name', 250)->nullable();
            }
            if (!Schema::hasColumn('order_items', 'image')) {
                $table->string('image', 250)->nullable();
            }
            if (!Schema::hasColumn('order_items', 'amount')) {
                $table->decimal('amount', 10, 2)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            foreach (['order_id', 'product_id', 'name', 'image', 'amount'] as $column) {
                if (Schema::hasColumn('order_items', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
