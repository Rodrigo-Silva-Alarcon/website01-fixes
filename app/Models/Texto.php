<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Texto extends Model
{
    protected $fillable = [
        'name',
        'fecha',
        'genero',
        'tipo',
        'vista_impresion',
        'imagen',
        'resumen',
        'contenido',
        'publicar',
        'sector',
    ];

    protected $casts = [
        'fecha' => 'date',
        'tipo' => 'array',
        'publicar' => 'boolean',
    ];

    public function getSectorLabelAttribute()
    {
        $sectors = config('variables.permission_sectors', []);
        return $sectors[$this->sector] ?? ucfirst($this->sector);
    }

    public function scopeBySector($query, $sector)
    {
        return $query->where('sector', $sector);
    }

    public function scopePublicados($query)
    {
        return $query->where('publicar', true);
    }

    public function scopeNoPublicados($query)
    {
        return $query->where('publicar', false);
    }

    public static function getSectors()
    {
        return config('variables.permission_sectors', []);
    }

    public static function getGeneros()
    {
        return [
            'masculino' => 'Masculino',
            'femenino' => 'Femenino',
        ];
    }

    public static function getTipos()
    {
        return [
            'reporte' => 'Reporte',
            'articulo' => 'Artículo',
            'noticia' => 'Noticia',
        ];
    }

    public static function getVistasImpresion()
    {
        return [
            'carta' => 'Carta',
            'a4' => 'A4',
            'legal' => 'Legal',
            'tabloide' => 'Tabloide',
        ];
    }
}


