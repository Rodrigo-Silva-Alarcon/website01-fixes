<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Traits\PostTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    use PostTrait;

    /**
     * Constructor del controlador.
     * Configurar el trait con los parámetros específicos para roles.
     */
    public function __construct()
    {
        // Configurar campos de búsqueda
        $this->configureSearchable(['name', 'description']);
        
        // Configurar campos ordenables
        $this->configureSortable(['name', 'created_at'], 'name', 'asc');
        
        // Configurar paginación
        $this->configurePagination(20);
        
        // Configurar relaciones a cargar
        $this->configureRelations(['permissions', 'users']);
        
        // Configurar reglas de validación personalizadas
        $this->configureCustomValidation([
            'name' => 'required|string|max:255|unique:roles,name',
            'description' => 'nullable|string|max:500',
        ]);
    }

    /**
     * Mostrar lista de roles con filtros automáticos
     */
    public function index(Request $request)
    {
        return $this->indexWithFilters($request, Role::class, 'admin/roles/Index');
    }

    /**
     * Mostrar formulario de creación
     */
    public function create()
    {
        $permissions = Permission::orderBy('sector')->orderBy('name')->get();
        $sectors = Permission::getSectors();
        
        return Inertia::render('admin/roles/Create', [
            'role' => new Role,
            'permissions' => $permissions,
            'sectors' => $sectors,
        ]);
    }

    /**
     * Crear nuevo rol
     */
    public function store(SaveRoleRequest $request)
    {
        $role = $this->createRecord($request, new Role);

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        return redirect()->route('admin.roles.index')
            ->with('success', 'Rol creado exitosamente.');
    }

    /**
     * Mostrar el rol especificado.
     */
    public function show(Role $role)
    {
        $role->load(['permissions', 'users']);
        $sectors = Permission::getSectors();

        return Inertia::render('admin/roles/Show', [
            'role' => $role,
            'sectors' => $sectors,
        ]);
    }

    /**
     * Mostrar formulario de edición
     */
    public function edit(Role $role)
    {
        $this->protectAdminRole($role);

        $role->load('permissions');
        $permissions = Permission::orderBy('sector')->orderBy('name')->get();
        $sectors = Permission::getSectors();

        return Inertia::render('admin/roles/Edit', [
            'role' => $role,
            'permissions' => $permissions,
            'sectors' => $sectors,
        ]);
    }

    /**
     * Actualizar rol existente
     */
    public function update(SaveRoleRequest $request, Role $role)
    {
        $this->protectAdminRole($role);
        $this->updateRecord($request, $role);

        // Al rol admin no se le pueden quitar permisos
        if ($role->name === 'admin') {
            $role->permissions()->sync(Permission::pluck('id'));
        } elseif ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        return redirect()->route('admin.roles.index')
            ->with('success', 'Rol actualizado exitosamente.');
    }

    /**
     * Eliminar el rol especificado de la base de datos.
     */
    public function destroy(Role $role)
    {
        $this->protectAdminRole($role);

        // Verificar si el rol tiene usuarios asignados
        if ($role->users()->count() > 0) {
            return redirect()->route('admin.roles.index')
                ->with('error', 'No se puede eliminar el rol porque tiene usuarios asignados.');
        }

        // Eliminar rol (los permisos se eliminarán automáticamente por cascade)
        $role->delete();

        return redirect()->route('admin.roles.index')
            ->with('success', 'Rol eliminado exitosamente.');
    }

    /**
     * Solo un admin puede tocar el rol admin; nunca se elimina ni se renombra.
     */
    private function protectAdminRole(Role $role): void
    {
        if ($role->name !== 'admin') {
            return;
        }

        abort_unless(request()->user()?->isAdmin(), 403);
        abort_if(request()->isMethod('delete'), 403, 'El rol admin no se puede eliminar.');
        abort_if(request()->isMethod('put') && request('name', 'admin') !== 'admin', 403, 'El rol admin no se puede renombrar.');
    }
}
