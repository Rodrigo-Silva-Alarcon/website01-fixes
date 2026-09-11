<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('texts', function (Blueprint $table) {
            $table->string('gender')->change();
        });
        DB::table('texts')->where('gender', 'masculino')->update(['gender' => 'male']);
        DB::table('texts')->where('gender', 'femenino')->update(['gender' => 'female']);
    }

    public function down(): void
    {
        DB::table('texts')->where('gender', 'male')->update(['gender' => 'masculino']);
        DB::table('texts')->where('gender', 'female')->update(['gender' => 'femenino']);
        Schema::table('texts', function (Blueprint $table) {
            $table->enum('gender', ['masculino', 'femenino'])->change();
        });
    }
};
