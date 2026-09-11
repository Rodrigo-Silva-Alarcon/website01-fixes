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
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('name', 250);
            $table->string('image', 100)->nullable();
            $table->integer('type')->nullable();
            $table->string('url', 200)->nullable();
            $table->integer('product_id')->nullable();
            $table->integer('page_id')->nullable();
            $table->longText('summary', 500)->nullable();
            $table->integer('order')->default(0);
            $table->text('pages')->nullable();
            $table->string('sw_title', 5)->nullable();
            $table->string('active', 5)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
