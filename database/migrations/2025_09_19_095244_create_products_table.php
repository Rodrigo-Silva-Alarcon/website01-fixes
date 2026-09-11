<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->integer('category_id');
            $table->integer('subcategory_id')->nullable();
            $table->integer('brand_id')->nullable();
            $table->string('name', 250);
            $table->string('slug', 250);
            $table->string('image', 250)->nullable();
            $table->text('summary')->nullable();
            $table->longText('description')->nullable();
            $table->longText('tecnical_info')->nullable();
            $table->string('tecnical_image', 250)->nullable();
            $table->integer('video_type')->nullable();
            $table->string('video_file', 250)->nullable();
            $table->string('video_url', 250)->nullable();
            $table->text('video_iframe')->nullable();
            $table->string('active', 2)->nullable();
            $table->string('featured', 2)->nullable();
            $table->string('pop', 2)->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
