<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('texts', function (Blueprint $table) {
            // Renombrar columnas de español a inglés
            $table->renameColumn('fecha', 'date');
            $table->renameColumn('genero', 'gender');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('vista_impresion', 'print_view');
            $table->renameColumn('imagen', 'image');
            $table->renameColumn('resumen', 'summary');
            $table->renameColumn('contenido', 'content');
            $table->renameColumn('publicar', 'publish');
            // sector se mantiene igual
        });
    }

    public function down(): void
    {
        Schema::table('texts', function (Blueprint $table) {
            // Revertir cambios
            $table->renameColumn('date', 'fecha');
            $table->renameColumn('gender', 'genero');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('print_view', 'vista_impresion');
            $table->renameColumn('image', 'imagen');
            $table->renameColumn('summary', 'resumen');
            $table->renameColumn('content', 'contenido');
            $table->renameColumn('publish', 'publicar');
        });
    }
};