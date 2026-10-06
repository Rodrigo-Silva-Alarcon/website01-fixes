<?php

use App\Services\WebContentService;
use App\Support\RichText;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Sanea el HTML del editor que ya estaba guardado (descripción y ficha técnica de productos,
 * contenido de textos). Lo nuevo se sanea al guardar en los modelos Product y Text.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->clean('products', ['description', 'technical_info']);
        $this->clean('texts', ['content']);

        WebContentService::flushCache();
    }

    public function down(): void
    {
        // Lo que se quitó (scripts, atributos on*) no se restaura.
    }

    private function clean(string $table, array $columns): void
    {
        DB::table($table)->select(['id', ...$columns])->orderBy('id')->chunk(100, function ($rows) use ($table, $columns) {
            foreach ($rows as $row) {
                $changes = [];
                foreach ($columns as $column) {
                    $clean = RichText::clean($row->$column);
                    if ($clean !== $row->$column) {
                        $changes[$column] = $clean;
                    }
                }
                if ($changes) {
                    DB::table($table)->where('id', $row->id)->update($changes);
                }
            }
        });
    }
};
