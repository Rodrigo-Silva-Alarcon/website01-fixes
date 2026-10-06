<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * El WhatsApp de Admin › Contacto pasa de "59168210861" a "+591 68210861"
 * (código de país, un espacio y el número seguido).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('contact_settings')->get(['id', 'whatsapp'])->each(function ($row) {
            $digits = preg_replace('/\D/', '', (string) $row->whatsapp);
            if (! str_starts_with($digits, '591') || str_contains((string) $row->whatsapp, ' ')) {
                return;
            }
            DB::table('contact_settings')->where('id', $row->id)->update(['whatsapp' => '+591 '.substr($digits, 3)]);
        });
    }

    public function down(): void
    {
        DB::table('contact_settings')->get(['id', 'whatsapp'])->each(function ($row) {
            DB::table('contact_settings')->where('id', $row->id)->update(['whatsapp' => preg_replace('/\D/', '', (string) $row->whatsapp)]);
        });
    }
};
