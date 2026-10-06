<?php

use App\Helpers\PermissionHelper;
use App\Models\ContactSetting;
use App\Services\WebContentService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Admin › Contacto: datos de contacto, horario de atención y textos de la página Contáctanos
 * en un solo lugar. El resto de la web (footer, topbar, showroom, Nosotros, carrito, checkout…)
 * lee teléfono, correo, dirección y horario de aquí.
 *
 * Los valores se copian de los textos que hasta ahora los guardaban (Admin › Textos) y esos
 * textos se retiran para que no haya dos lugares donde editar lo mismo.
 */
return new class extends Migration
{
    /** Texto (Admin › Textos) => columna de contact_settings */
    private const MOVED_TEXTS = [
        'footer_whatsapp' => 'whatsapp',
        'footer_email' => 'email',
        'showroom_address' => 'address',
        'footer_address' => 'city',
        'footer_maps' => 'maps_url',
        'site_url' => 'website',
        'footer_facebook' => 'facebook',
        'footer_instagram' => 'instagram',
        'footer_twitter' => 'twitter',
        'business_hours' => 'schedule_summary',
        'topbar_3' => null,
    ];

    public function up(): void
    {
        Schema::create('contact_settings', function (Blueprint $table) {
            $table->id();
            // Datos
            $table->string('whatsapp', 20);
            $table->string('phone', 40)->nullable();
            $table->string('email');
            $table->string('form_recipient')->nullable();
            $table->text('address');
            $table->string('city')->nullable();
            $table->string('maps_url', 500)->nullable();
            $table->string('website')->nullable();
            $table->string('facebook')->nullable();
            $table->string('instagram')->nullable();
            $table->string('twitter')->nullable();
            $table->string('tiktok')->nullable();
            // Horario
            $table->json('schedule');
            $table->string('schedule_summary')->nullable();
            // Textos de la página Contáctanos
            $table->string('hero_title');
            $table->text('hero_subtitle')->nullable();
            $table->string('form_title');
            $table->string('form_subtitle')->nullable();
            $table->string('form_success');
            $table->string('hours_title');
            $table->string('hours_note')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('contact_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('action', 40)->index();
            $table->string('field', 60)->nullable();
            $table->json('old_value')->nullable();
            $table->json('new_value')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });

        $texts = DB::table('texts')->whereIn('name', array_keys(self::MOVED_TEXTS))->pluck('content', 'name');
        $plain = fn (string $name) => self::plain($texts[$name] ?? null);
        $now = now();

        DB::table('contact_settings')->insert([
            'whatsapp' => preg_replace('/\D/', '', $plain('footer_whatsapp')) ?: '59168210861',
            'email' => $plain('footer_email') ?: 'contacto@smarthouse.com.bo',
            'address' => $plain('showroom_address') ?: "Av. 20 de Octubre\nEsq. Rosendo Gutierrez\nEdif. Guadalquivir #2332",
            'city' => $plain('footer_address') ?: 'La Paz, Bolivia',
            'maps_url' => $plain('footer_maps') ?: null,
            'website' => $plain('site_url') ?: 'www.smarthousebo.com',
            'facebook' => $plain('footer_facebook') ?: null,
            'instagram' => $plain('footer_instagram') ?: null,
            'twitter' => $plain('footer_twitter') ?: null,
            'schedule' => json_encode(ContactSetting::DEFAULT_SCHEDULE),
            'schedule_summary' => $plain('business_hours') ?: 'Atención de lunes a sábado',
            ...ContactSetting::DEFAULT_TEXTS,
            // El formulario se quitó después (2026_10_11_000000_replace_contact_form_with_map)
            'form_title' => 'Envíanos un mensaje',
            'form_success' => 'El mensaje fue enviado exitosamente.',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('texts')->whereIn('name', array_keys(self::MOVED_TEXTS))->delete();

        // Permisos del nuevo sector para instalaciones ya sembradas, asignados al rol admin
        // (los demás roles se configuran en Admin › Roles). En una BD nueva los crea PermissionSeeder.
        $adminId = DB::table('roles')->where('name', 'admin')->value('id');
        if ($adminId) {
            PermissionHelper::createSectorPermissions('contact', 'Contacto');
            foreach (DB::table('permissions')->where('sector', 'contact')->pluck('id') as $permissionId) {
                DB::table('permission_role')->insertOrIgnore(['role_id' => $adminId, 'permission_id' => $permissionId]);
            }
        }

        WebContentService::flushCache();
    }

    public function down(): void
    {
        // Devuelve los datos a Admin › Textos
        $contact = DB::table('contact_settings')->first();
        if ($contact) {
            $now = now();
            foreach (self::MOVED_TEXTS as $name => $column) {
                $value = $column ? $contact->$column : $contact->schedule_summary;
                if (blank($value) || DB::table('texts')->where('name', $name)->exists()) {
                    continue;
                }
                if ($name === 'showroom_address') {
                    $value = collect(explode("\n", $value))->map(fn ($line) => '<p>'.e(trim($line)).'</p>')->implode('');
                }
                DB::table('texts')->insert([
                    'name' => $name,
                    'date' => $now->toDateString(),
                    'gender' => 'male',
                    'type' => json_encode(['article']),
                    'print_view' => 'a4',
                    'content' => $value,
                    'publish' => true,
                    'sector' => 'texto',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        $ids = DB::table('permissions')->where('sector', 'contact')->pluck('id');
        DB::table('permission_role')->whereIn('permission_id', $ids)->delete();
        DB::table('permissions')->whereIn('id', $ids)->delete();

        Schema::dropIfExists('contact_logs');
        Schema::dropIfExists('contact_settings');

        WebContentService::flushCache();
    }

    /** HTML del editor enriquecido → texto plano, un párrafo por línea. */
    private static function plain(?string $html): string
    {
        if ($html === null) {
            return '';
        }
        $text = preg_replace(['/<br\s*\/?>/i', '/<\/(p|div|li|h[1-6])>/i'], "\n", $html);
        $text = html_entity_decode(strip_tags($text), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return collect(explode("\n", $text))->map(fn ($line) => trim($line))->filter()->implode("\n");
    }
};
