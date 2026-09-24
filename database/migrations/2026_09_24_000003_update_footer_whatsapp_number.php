<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('texts')
            ->where('name', 'footer_whatsapp')
            ->update(['content' => '59168210861']);
        Cache::forget('web_cms_texts');
    }

    public function down(): void
    {
        DB::table('texts')
            ->where('name', 'footer_whatsapp')
            ->update(['content' => '59170000000']);
        Cache::forget('web_cms_texts');
    }
};
