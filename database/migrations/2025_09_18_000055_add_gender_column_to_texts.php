<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /* Schema::table('texts', function (Blueprint $table) {
            $table->enum('gender', ['male', 'female'])->default('male')->after('date');
        }); */
    }

    public function down(): void
    {
        /* Schema::table('texts', function (Blueprint $table) {
            $table->dropColumn('gender');
        }); */
    }
};