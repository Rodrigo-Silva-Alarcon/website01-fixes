<?php

namespace App\Traits;

/**
 * Búsqueda y ordenamiento de listados: campos buscables, campos ordenables
 * y criterios por defecto aplicados por indexWithFilters().
 */
trait Searchable
{
    // Configuración de búsqueda y ordenamiento
    public ?array $searchableFields = null;
    public ?array $sortableFields = null;
    public ?string $defaultSortField = 'id';
    public ?string $defaultSortOrder = 'asc';

    /**
     * Configurar campos de búsqueda
     */
    public function configureSearchable(array $fields): void
    {
        $this->searchableFields = $fields;
    }

    /**
     * Configurar campos ordenables
     */
    public function configureSortable(array $fields, ?string $defaultField = null, ?string $defaultOrder = null): void
    {
        $this->sortableFields = $fields;
        $this->defaultSortField = $defaultField ?? 'id';
        $this->defaultSortOrder = $defaultOrder ?? 'asc';
    }
}
