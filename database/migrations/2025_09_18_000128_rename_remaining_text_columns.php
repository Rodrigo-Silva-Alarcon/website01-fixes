<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /* Schema::table('texts', function (Blueprint $table) {
            // Renombrar las columnas que faltan
            $table->renameColumn('fecha', 'date');
        }); */
    }

    public function down(): void
    {
        /* Schema::table('texts', function (Blueprint $table) {
            $table->renameColumn('date', 'fecha');
        }); */
    }
};