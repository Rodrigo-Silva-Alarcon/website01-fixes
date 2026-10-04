<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Textos de la página "Nosotros" (una sola fila). */
class AboutPage extends Model
{
    protected $table = 'about_page';

    /** Campos de texto editables, con su etiqueta para el historial. */
    public const FIELDS = [
        'title' => 'Título',
        'title_highlight' => 'Título (palabra destacada)',
        'intro' => 'Descripción',
        'mission_title' => 'Título de misión',
        'mission' => 'Misión',
        'vision_title' => 'Título de visión',
        'vision' => 'Visión',
    ];

    protected $fillable = ['title', 'title_highlight', 'intro', 'mission_title', 'mission', 'vision_title', 'vision', 'updated_by'];

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
