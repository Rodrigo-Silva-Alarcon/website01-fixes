<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add indexes on frequently queried FK/slug columns and foreign keys
     * where local data (0 orphans) and the test suite are safe.
     *
     * Intentionally NOT constrained (index only) — see down()/report:
     * - products.brand_id        (tests seed synthetic brand_id 1..3)
     * - cart_items.product_id    (tests seed product_id 42/123)
     * - order_items.product_id   (checkout copies cart product_id)
     * - orders.user_id           (guest checkout uses sentinel user_id = 0)
     * - payments.user_id         (guest checkout uses sentinel user_id = 0)
     * - orders.card_id           (checkout deletes cart after order keeps card_id)
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index('slug');
            $table->index('category_id');
            $table->index('subcategory_id');
            $table->index('brand_id');
            $table->foreign('category_id')->references('id')->on('categories');
            $table->foreign('subcategory_id')->references('id')->on('subcategories')->nullOnDelete();
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->index('slug');
        });

        Schema::table('subcategories', function (Blueprint $table) {
            $table->index('slug');
            $table->index('category_id');
            $table->foreign('category_id')->references('id')->on('categories');
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->index('user_id');
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->index('cart_id');
            $table->index('product_id');
            $table->foreign('cart_id')->references('id')->on('carts')->onDelete('cascade');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index('card_id');
            $table->index('user_id');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->index('order_id');
            $table->index('product_id');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index('order_id');
            $table->index('user_id');
            $table->foreign('order_id')->references('id')->on('orders');
        });

        Schema::table('inventories', function (Blueprint $table) {
            $table->index('product_id');
            $table->foreign('product_id')->references('id')->on('products');
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->index('product_id');
            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropIndex(['product_id']);
        });

        Schema::table('inventories', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropIndex(['product_id']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropIndex(['order_id']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropIndex(['order_id']);
            $table->dropIndex(['product_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['card_id']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropForeign(['cart_id']);
            $table->dropIndex(['cart_id']);
            $table->dropIndex(['product_id']);
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('subcategories', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropIndex(['category_id']);
            $table->dropIndex(['slug']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['slug']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['subcategory_id']);
            $table->dropForeign(['category_id']);
            $table->dropIndex(['slug']);
            $table->dropIndex(['category_id']);
            $table->dropIndex(['subcategory_id']);
            $table->dropIndex(['brand_id']);
        });
    }
};
