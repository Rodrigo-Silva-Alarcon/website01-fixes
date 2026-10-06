<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['video_type', 'video_file', 'video_url', 'video_iframe']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->integer('video_type')->nullable();
            $table->string('video_file', 250)->nullable();
            $table->string('video_url', 250)->nullable();
            $table->text('video_iframe')->nullable();
        });
    }
};
