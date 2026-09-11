<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SavePermissionRequest;
use App\Models\Permission;
use App\Traits\PostTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermissionController extends Controller
{
    use PostTrait;

    /**
     * Constructor del controlador.
     * Configurar el trait con los parámetros específicos para permisos.
     */
    public function __construct()
    {
        // Configurar campos de búsqueda
        $this->configureSearchable(['name', 'description', 'sector']);
        
        // Configurar campos ordenables
        $this->configureSortable(['name', 'sector', 'created_at'], 'name', 'asc');
        
        // Configurar paginación
        $this->configurePagination(20);
        
        // Configurar relaciones a cargar
        $this->configureRelations(['roles']);
        
        // Configurar relaciones con conteo
        $this->configureWithCount(['roles']);
        
        // Configurar reglas de validación personalizadas
        $this->configureCustomValidation([
            'name' => 'required|string|max:255|unique:permissions,name',
            'description' => 'nullable|string|max:500',
            'sector' => 'required|string|in:' . implode(',', array_keys(config('variables.permission_sectors', []))),
        ]);
    }

    /**
     * Mostrar lista de permisos con filtros automáticos
     */
    public function index(Request $request)
    {
        $sectors = Permission::getSectors();
        
        return $this->indexWithFilters($request, Permission::class, 'admin/permissions/Index', [
            'sectors' => $sectors,
        ]);
    }

    /**
     * Mostrar formulario de creación
     */
    public function create()
    {
        return Inertia::render('admin/permissions/Create', [
            'permission' => new Permission,
            'sectors' => Permission::getSectors(),
        ]);
    }

    /**
     * Crear nuevo permiso
     */
    public function store(SavePermissionRequest $request)
    {
        $this->createRecord($request, new Permission);

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permiso creado exitosamente.');
    }

    /**
     * Mostrar el permiso especificado.
     */
    public function show(Permission $permission)
    {
        $permission->load(['roles']);
        
        // Agregar atributos calculados
        $permission->sector_label = $permission->sector_label;

        return Inertia::render('admin/permissions/Show', [
            'permission' => $permission,
        ]);
    }

    /**
     * Mostrar formulario de edición
     */
    public function edit(Permission $permission)
    {
        return Inertia::render('admin/permissions/Edit', [
            'permission' => $permission,
            'sectors' => Permission::getSectors(),
        ]);
    }

    /**
     * Actualizar permiso existente
     */
    public function update(SavePermissionRequest $request, Permission $permission)
    {
        $this->updateRecord($request, $permission);

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permiso actualizado exitosamente.');
    }

    /**
     * Eliminar el permiso especificado de la base de datos.
     */
    public function destroy(Permission $permission)
    {
        // Verificar si el permiso está asignado a roles
        if ($permission->roles()->count() > 0) {
            return redirect()->route('admin.permissions.index')
                ->with('error', 'No se puede eliminar el permiso porque está asignado a roles.');
        }

        // Eliminar permiso
        $permission->delete();

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permiso eliminado exitosamente.');
    }
}
