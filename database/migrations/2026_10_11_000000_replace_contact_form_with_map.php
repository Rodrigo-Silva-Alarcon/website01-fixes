<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Contáctanos deja de tener formulario: en su lugar se muestra un mapa con la dirección
 * del showroom, que se activa o desactiva en Admin › Contacto.
 */
return new class extends Migration
{
    private const FORM_COLUMNS = ['form_recipient', 'form_title', 'form_subtitle', 'form_success'];

    public function up(): void
    {
        Schema::table('contact_settings', function (Blueprint $table) {
            $table->boolean('show_map')->default(true)->after('hero_subtitle');
        });

        Schema::table('contact_settings', function (Blueprint $table) {
            $table->dropColumn(self::FORM_COLUMNS);
        });
    }

    public function down(): void
    {
        Schema::table('contact_settings', function (Blueprint $table) {
            $table->string('form_recipient')->nullable()->after('email');
            $table->string('form_title')->default('Envíanos un mensaje');
            $table->string('form_subtitle')->nullable();
            $table->string('form_success')->default('El mensaje fue enviado exitosamente.');
        });

        Schema::table('contact_settings', function (Blueprint $table) {
            $table->dropColumn('show_map');
        });
    }
};
