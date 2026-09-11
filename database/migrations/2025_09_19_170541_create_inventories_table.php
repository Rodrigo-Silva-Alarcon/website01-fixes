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
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->integer('product_id');
            $table->decimal('amount', 10, 2);
            $table->decimal('offer_amount', 10, 2)->nullable();
            $table->date('ini')->nullable();
            $table->date('fin')->nullable();
            $table->integer('stock')->nullable();
            $table->string('money')->default('Bo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};