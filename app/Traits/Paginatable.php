<?php

namespace App\Traits;

/**
 * Paginación de listados: tamaño de página aplicado por indexWithFilters().
 */
trait Paginatable
{
    // Configuración de paginación
    public ?int $perPage = 20;

    /**
     * Configurar paginación
     */
    public function configurePagination(int $perPage): void
    {
        $this->perPage = $perPage;
    }
}
