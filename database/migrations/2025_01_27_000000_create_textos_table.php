<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('texts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('fecha');
            $table->enum('genero', ['masculino', 'femenino']);
            $table->json('tipo'); // Para almacenar múltiples tipos seleccionados
            $table->string('vista_impresion');
            $table->string('imagen')->nullable();
            $table->text('resumen')->nullable();
            $table->longText('contenido')->nullable();
            $table->boolean('publicar')->default(false);
            $table->string('sector')->default('texto');
            $table->timestamps();
            
            $table->index('sector');
            $table->index('publicar');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('texts');
    }
};
